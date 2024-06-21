var express = require('express');
var router = express.Router();
const yaml = require('js-yaml');
// jsonData = yaml.load(yamlString)    yamlString = yaml.dump(jsonData);


// GitHub 仓库信息
const owner = 'jeremyhann';
const repo = 'jeremyhann.github.io';
const branch = 'main';  // 或其他分支名
const token = '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';  // 如果是私有仓库，需要 GitHub Token

const headers = { Authorization: `token ${token}` };




router.get('/list',async(req, res) => {

  
  const fileData = await fetchFileContent('source/_data/sidebar.yml');
  let content = yaml.load(fileData.content)
  let { list , category} =  formatList(content)
  res.cc({
    ...fileData,
    content,
    category,
    list,
  })
})

router.get('/doc/:path',async(req, res) => {
  const fileData = await fetchFileContent('source/_data/sidebar.yml');
  let content = yaml.load(fileData.content)
  res.cc({
    ...fileData,
    content,
  })
})


router.post('/save',async(req, res) => {
  // debugger
  const { title , category , content , sha} = req.body
  const filePath = `source/docs/${title.replaceAll(' ','-')}.md`;  // 修改的文件路径
  const commitMessage = 'Update file content';  // 提交信息
  await pushFile(filePath, content, commitMessage ,sha);

  res.cc({message:'Content updated successfully'})
})



function formatList(content){
  let list = [] //tableList
  let category = []
  let path1Arry = Object.keys(content) 
  path1Arry.map((path1,index)=>{
    let path2Arry = Object.keys(content[path1])
    category.push({
      label:formatText(path1),
      value:path1,
      children:[]
    })
    path2Arry.map(path2=>{
      let path3Arry = Object.keys(content[path1][path2])
      category[index].children.push({
        label:formatText(path2),
        value:path2,
      })

      path3Arry.map(path3=>{
        list.push({
          title:formatText(path3),
          category:[path1,path2],
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
      const data = await response.json();
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