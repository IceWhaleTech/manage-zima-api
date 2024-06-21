const fs = require('fs');
const path = require('path');

// 读取文件内容的中间件
const readFileMiddleware = (filePath)=> {
  return (req, res, next) => {
    const absolutePath = path.join(__dirname, filePath);
    fs.readFile(absolutePath, 'utf8', (err,data)=>{
      if(err){
        console.error('Error reading file:',err);
        return res.status(500).send('Internal Server Error');
      }
      req.fileContent = data
      next()
    })
  }
}

// 写入文件内容的中间件
const writeFileMiddleware = (filePath) => {
  return (req, res, next) => {
    const absolutePath = path.join(__dirname, filePath);
    const dataToWrite = JSON.stringify(req.body); // 假设要写入的内容存储在 req.fileContentToWrite
    console.log(dataToWrite)
    if (!dataToWrite) {
      return res.status(400).send('No content to write');
    }

    fs.writeFile(absolutePath, dataToWrite, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Internal Server Error');
      }
      next();
    });
  };
};

module.exports = {
  readFileMiddleware,
  writeFileMiddleware
};