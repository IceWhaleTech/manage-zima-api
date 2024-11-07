var express = require('express');
var router = express.Router();
const yaml = require('js-yaml');
const { GITHUBTOKEN } = require('../utils/constant');


// yaml文件格式转换
// jsonData = yaml.load(yamlString)    yamlString = yaml.dump(jsonData);


// GitHub 仓库信息
// 测试环境
const owner = 'jeremyhann'; // 所有人
const repo = 'ZimaDocs'; // 项目目录
// 生产环境
// const owner = 'IceWhaleTech'; 
// const repo = 'ZimaDocs';

const branch = 'main';  // 或其他分支名
const token = GITHUBTOKEN;  // 如果是私有仓库，需要 GitHub Token

const headers = { Authorization: `token ${token}` };

// 定义全局主目录
const MenuPath = 'source/_data/sidebar.yml'
const LangEnPath = 'themes/zima/languages/en.yml'
let DocsMenu = {
  content: null,
  sha: null
}
const LangEn = {
  content: null,
  sha:null
}

// 获取目录列表
router.get('/list',async(req, res) => {
  const fileData = await fetchFileContent(MenuPath);
  let content = yaml.load(fileData.content)
  DocsMenu.content = content
  DocsMenu.sha = fileData.sha
  // language
  const langFile = await fetchFileContent(LangEnPath);
  LangEn.content = yaml.load(langFile.content) 
  LangEn.sha = langFile.sha

  let { list , category} =  formatList(content,LangEn.content)
  res.cc({
    ...fileData,
    content,
    category,
    list,
    langEn: LangEn.content
  })
})

// 获取指定文章
router.get('/doc/:fileName',async(req, res) => {
  // console.log(req.params.fileName)
  let {fileName} = req.params
  let {path} = req.query
  const fileData = await fetchFileContent(`source/${path}/`+fileName);
  if(fileData && fileData.content){
    let content = fileData.content
    res.cc({
      ...fileData,
      content,
    })
  }else{
    res.cc({
      message:'file not found'
    })
  }
})

// 新增或者保存 type : add edit
router.post('/save',async(req, res) => {
  const { type , title, title_origin  ,category , category_origin , fileKey , fileName , content , sha} = req.body
  // 保存文章
  const filePath = `source/${category[0]}/${fileName}.md`;  // 修改的文件路径
  const commitMessage = 'Update file content';  // 提交信息
  await pushFile(filePath, content, commitMessage ,sha);

  //更新 slidebar 文件 新增或者分类变更
  if(type=='add'||(category_origin.length && (category[1] !== category_origin [1]))){
    // 如果缓存不存在 先获取 文件
    if(!DocsMenu.sha){
      const fileData = await fetchFileContent(MenuPath);
      DocsMenu.content = yaml.load(fileData.content)
      DocsMenu.sha = fileData.sha
    }
    let menuContent = DocsMenu.content
    // 如果存在旧标题 先删除相关键值 
    if(category_origin.length){
      delete menuContent[category_origin[0]][category_origin[1]][fileKey]
    }
    menuContent[category[0]][category[1]][fileKey] = fileName + '.html'
    await pushFile(MenuPath, yaml.dump(menuContent), 'update slidebar' ,DocsMenu.sha);
  }
  
  // 更新 language 文件 title变更或者分类变更
  if(title_origin != title||(category_origin.length && (category[1] !== category_origin [1]))){
    if(!LangEn.sha){
      const langFile = await fetchFileContent(LangEnPath);
      LangEn.content = yaml.load(langFile.content) 
      LangEn.sha = langFile.sha
    }
    let langContent = LangEn.content;
    // 先删除原有
    if(type == 'edit') {
      delete langContent['sidebar'][category_origin[0]][fileKey]
    }
    langContent['sidebar'][category[0]][fileKey] = title
    // 异步延迟推送 防止异步编译导致展示不正确的情况
    setTimeout(() => {
      pushFile(LangEnPath, yaml.dump(langContent), 'update langEn' ,LangEn.sha);
    }, 3000);
  }
  
  res.cc({message:'Content updated successfully'})
})



function formatList(content, langEn){
  let list = [] //tableList
  let category = []
  let path1Arry = Object.keys(content)
  let sidebar = langEn.sidebar
  path1Arry.map((path1,index)=>{
    let path2Arry = Object.keys(content[path1])
    category.push({
      label:langEn.menu[path1],
      value:path1,
      children:[]
    })
    path2Arry.map(path2=>{
      let path3Arry = Object.keys(content[path1][path2])
      category[index].children.push({
        label:sidebar[path1][path2],
        value:path2,
      })

      path3Arry.map(path3=>{
        list.push({
          title: sidebar[path1][path3],
          category:[langEn.menu[path1],sidebar[path1][path2]],
          categoryKey:[path1,path2],
          fileKey:path3,
          fileName:content[path1][path2][path3]
        })
      })
    })
  })
  return {
    list,
    category
  }
}

// 去除标题或分类上的 _ 换成空格
const formatText = (text)=>{
  return text.replaceAll('_',' ')
}


// 获取文件内容的函数
async function fetchFileContent(filePath) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
  try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`Error fetching file: ${response.statusText}`);
      }
      const data = await response.json();
      // console.log('Fetched data:', data);
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const sha = data.sha;
      return { content, sha };
  } catch (error) {
      console.error('Error fetching file content:', error);
      return null;
  }
}


// 推送文件的函数 
async function pushFile(filePath, content, message , sha) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const data = {
      message: message,
      content: Buffer.from(content).toString('base64'),
      branch: branch,
      sha: sha,
  };
  
  try {
      const response = await fetch(url, {
          method: 'PUT',
          headers: {
              ...headers,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      });
      if (response.ok) {
          console.log(`Uploaded: ${filePath}`);
      } else {
          console.error('Error uploading file:', await response.text());
      }
  } catch (error) {
      console.error('Error uploading file:', error);
  }
}



module.exports = router;