
/**
 * @swagger
 * tags:
 *   - name: gallery
 *     description: Operations about gallery
 * /gallery/list:
 *   get:
 *     description: 获取list
 *     tags: [gallery]
 *     responses:
 *       200:
 *         description: Success
 * /gallery/add:
 *   post:
 *     description: 编辑list
 *     tags: [gallery]
 *     parameters:
 *       - name: id
 *         required: true
 *       - name: title
 *         required: true 
 *       - name: src
 *         required: true 
 *     responses:
 *       200:
 *         description: Success
 * /gallery/edit/:id:
 *   put:
 *     description: 编辑list
 *     tags: [gallery]
 *     parameters:
 *       - name: id
 *         required: true
 *       - name: title
 *         required: true 
 *       - name: src
 *         required: true 
 *     responses:
 *       200:
 *         description: Success
 * /gallery/delete/:id:
 *   delete:
 *     description: 删除item
 *     tags: [gallery]
 *     parameters:
 *       - name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Success
 */

var express = require('express');
var router = express.Router();
const db = require('../utils/db');
/* GET gallery page. */

const table = "gallery"
router.get('/list', (req, res) => {
  let type = req.query.type
  let status = req.query.status
  const query = `SELECT * FROM ${table} WHERE 1=1  ${status?'and status='+status:''}  ${type?'and type='+type:''}`;
  db.query(query, (err, results) => {
    if (err) {
      return res.err(err.message);
    }
    res.cc(results.sort((a,b) => a.sort - b.sort));
  });
})

// 新增
router.post('/add', (req, res) => {
  const { title, src, status, sort, category, type } = JSON.parse(JSON.stringify(req.body))
  const create_time = new Date()
  const query = `INSERT INTO ${table} (title, src,status,sort,create_time,category,type) VALUES ( ?,?, ?,?, ?,?, ?)`;
  db.query(query, [title, src, status, sort, create_time, category, type], (err, result) => {
    if (err) {
      return res.err(err.message);
    }
    res.cc({ message: '新增成功' });
  });
})

// 修改
// Update (PUT)
router.put('/edit', (req, res) => {
  const { title, src, status, sort, category, type , id  } = req.body;
  const query = `UPDATE ${table} SET title = ?, src = ? ,status = ?, sort = ? ,category = ?, type = ? WHERE id = ?`;
  db.query(query, [title, src, status, sort, category, type , id], (err, result) => {
    if (err) {
      return res.err(err.message);;
    }
    if (result.affectedRows === 0) {
      return res.err(err.message,404);
    }
    res.cc({ message: '编辑成功' });
  });
});


// Delete (DELETE)
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM ${table} WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      return res.err(err.message);;
    }
    if (result.affectedRows === 0) {
      return res.err(err.message,404);
    }
    res.cc({ message: '删除成功' });
  });
});

module.exports = router;