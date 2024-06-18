
/**
 * @swagger
 * /example:
 *   get:
 *     description: Example route
 *     responses:
 *       200:
 *         description: Success
 */

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
