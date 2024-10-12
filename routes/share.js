var express = require('express');
var router = express.Router();

const { readFileMiddleware , writeFileMiddleware} = require('../utils/fileMiddleware');


const filePath = '../public/files/share.json'
router.get('/data',readFileMiddleware(filePath), function(req, res){
  res.cc(JSON.parse(req.fileContent))
})

router.post('/save',writeFileMiddleware(filePath),function(req, res){
  res.cc({message:'saved successfully'})
} )



module.exports = router;