const express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');

// 设置multer存储配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 创建上传图片的接口
router.post('/image', upload.single('image'), (req, res) => {
    try {
        res.status(200).json({
            message: 'Image uploaded successfully',
            filePath: `/static/images/${req.file.filename}`
        });
    } catch (error) {
        res.status(400).json({ message: 'Image upload failed', error: error.message });
    }
});


module.exports = router;