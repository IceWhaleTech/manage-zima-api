var express = require('express');
var router = express.Router();
const { YouTubeSearch } = require('youtube-search-api');
const { google } = require('googleapis');
const ExcelJS = require('exceljs');
const { YOUTUBEKEY } = require('../utils/constant');
const puppeteer = require('puppeteer');
const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBEKEY,
});


router.get('/list', async(req, res) => {
  let keyword = req.query.keyword || 'insta360'
  let maxResults = req.query.maxResults || 20
  let nextPageToken = req.query.nextPageToken || null
  const searchResponse = await youtube.search.list({
    part: 'snippet',
    q: keyword,
    maxResults: maxResults,
    pageToken: nextPageToken,
  });
  const videoDetails = await Promise.all(
    searchResponse.data.items.map(async item => {
        const videoId = item.id.videoId;
        const channelId = item.snippet.channelId;

        if (!videoId || !channelId) {
            console.error('Missing videoId or channelId:', item);
            return null; // 跳过无效条目
        }

        // 获取视频统计信息
        const videoResponse = await youtube.videos.list({
            part: 'statistics',
            id: videoId,
        });

        const viewCount = videoResponse.data.items[0]?.statistics?.viewCount || 0;

        // 获取频道信息，包括订阅者数量
        const channelResponse = await youtube.channels.list({
            part: 'statistics',
            id: channelId,
        });
        const channelData = channelResponse.data.items[0]?.statistics

        return {
            title: item.snippet.title,
            videoId: videoId,
            viewCount: fnFormatK(viewCount),
            videoCover: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            channelId: channelId,
            channelUrl: `https://www.youtube.com/channel/${channelId}`,
            subscriberCount:  fnFormatK(channelData.subscriberCount),
            channelViewCount: fnFormatK(channelData.viewCount),
            channelVedioCount: fnFormatK(channelData.videoCount),
            channelAverageViewCount: fnFormatK(channelData.viewCount/channelData.videoCount),
        };
    })
  );

  // const channelId = 'UC3DkFux8Iv-aYnTRWzwaiBA'; // 替换为你要抓取的频道ID
  // const channelInfo = await getChannelInfo(channelId);
  res.cc({
    nextPageToken: searchResponse.data.nextPageToken,
    list:videoDetails.filter(item => item !== null)});
  // res.cc(videoDetails,searchResponse);
})

router.get('/social', async(req, res) => { 
  const channelId = req.query.channelId;
  const channelInfo = await getChannelInfo(channelId);
  res.cc(channelInfo);
})



// 虚拟浏览器抓取频道信息
async function getChannelInfo(channelId) {
  const url = `https://www.youtube.com/channel/${channelId}/about`;

  const browser = await puppeteer.launch({ headless: true ,args: ['--no-sandbox']});
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  // 抓取频道描述
  const description = await page.evaluate(() => {
      const element = document.querySelector('#description-container');
      return element ? element.innerText : null;
  });

  // 抓取邮箱地址（需要用户点击“查看邮箱地址”）
  let email = null;
  try {
      await page.click('yt-formatted-string:contains("查看邮箱地址")');
      await page.waitForSelector('#email-container a');
      email = await page.evaluate(() => {
          const element = document.querySelector('#email-container a');
          return element ? element.innerText : null;
      });
  } catch (err) {
      console.log('邮箱地址未找到或需要验证');
  }

  // 抓取社交媒体链接
  const socialLinks = await page.evaluate(() => {
      const elements = document.querySelectorAll('#link-list-container a');
      return Array.from(elements).map(element => ({
          text: element.innerText,
          href: element.href,
      }));
  });

  await browser.close();

  return {
      description,
      email,
      socialLinks,
  };
}

const fnFormatK = (num,fixed=1) => {
  return num > 999 ? (num / 1000).toFixed(fixed) + 'k' : num
}

module.exports = router;