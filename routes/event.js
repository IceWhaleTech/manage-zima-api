var express = require('express');
var router = express.Router();

const { readFileMiddleware , writeFileMiddleware} = require('../utils/fileMiddleware');


const filePath = '../public/files/event.json'
router.get('/list',readFileMiddleware(filePath), function(req, res){
  res.cc(JSON.parse(req.fileContent))
})

router.post('/save',writeFileMiddleware(filePath),function(req, res){
  res.cc({message:'saved successfully'})
} )



module.exports = router;