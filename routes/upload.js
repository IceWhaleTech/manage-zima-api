const express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const Jimp = require('jimp');
const fs = require('fs')

// 设置multer存储配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let path = req.body.path || '/images'
        cb(null, 'public'+path);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+ '_' + file.originalname);
    }
});

const upload = multer({ storage: storage });



// 创建上传图片的接口
router.post('/image', upload.single('image'), async(req, res) => {
    try {
        const { filename } = req.file
        let image = await Jimp.read(req.file.path)
        image.resize(500,Jimp.AUTO).quality(80).write(path.resolve(req.file.destination,'resized_'+filename))
        res.status(200).json({
            message: 'Image uploaded successfully',
            filePath: `/static/images/${req.file.filename}`
        });
    } catch (error) {
        res.status(400).json({ message: 'Image upload failed', error: error.message });
    }
});
// 图片上传及批量上传  可选参数 req.body.path '/images'|| '/docs'
router.post('/batchImages',upload.array('file',10),async(req, res) => {
  let files = req.files;
  res.cc(files.map(item => {
    item.filePath = item.path.replace('public','/static')
    return item
  }))
})

// router.get('/batchResize',(req, res) => {
//   // 读取目录下的所有文件
//   let destination = 'public/images'
//   fs.readdir(destination, async(err, files)=> {
//     if (err) {
//       console.log('Error', err);
//     } else {
//       let jimps = []
//       files.map(async(file)=>{
//         if((file.indexOf('png')||file.indexOf('jpg'))&&file.indexOf('resized')<0){
//           // jimps.push(await Jimp.read(destination+'/'+file))
//           let image = await Jimp.read(destination+'/'+file)
//           image.resize(500,Jimp.AUTO).quality(80).writeAsync(path.resolve(destination,'resized_'+file))

//         }
//       })
//       Promise.all(jimps).then

//       res.cc({message:'压缩成功'});
//     }
//   });
// })

module.exports = router;