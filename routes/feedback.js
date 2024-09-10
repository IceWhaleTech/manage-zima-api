
var express = require('express');
var router = express.Router();
const db = require('../utils/db');
/* GET gallery page. */

// { fb_system,fb_page,fb_name,email,content, operator,remark,status,valid , createTime,updateTime}

const table = "feedback"
router.get('/list', (req, res) => {
  let status = req.query.status
  const query = `SELECT * FROM ${table} WHERE 1=1  ${status ? 'and status=' + status : ''} `;
  db.query(query, (err, results) => {
    if (err) {
      return res.err(err.message);
    }
    res.cc(results.sort((a, b) => b.id - a.id));
  });
})

// 新增
router.post('/add', (req, res) => {
  console.log(req.body)
  const { fb_system, fb_page, fb_name, email, content } = JSON.parse(JSON.stringify(req.body))
  const create_time = new Date()
  const query = `INSERT INTO ${table} (create_time,fb_system,fb_page,fb_name,email,content) VALUES (?,?,?, ?,?, ?)`;
  const values = [create_time, fb_system, fb_page, fb_name, email, content]

  db.query(query, values, (err, result) => {
    if (err) {
      return res.err(err.message);
    }
    res.cc({ message: '新增成功' });
  });
})

// 修改
// Update (PUT)
router.put('/edit', (req, res) => {
  const {id , remark,status,valid } = req.body;
  const update_time = new Date()
  const operator = req.auth.name

  const query = `UPDATE ${table} SET update_time = ?, operator = ? ,remark = ?, status = ? ,valid = ? WHERE id = ?`;
  db.query(query, [ update_time , operator , remark , status , valid , id ], (err, result) => {
    if (err) {
      return res.err(err.message);;
    }
    if (result.affectedRows === 0) {
      return res.err(err.message, 404);
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
      return res.err(err.message, 404);
    }
    res.cc({ message: '删除成功' });
  });
});

module.exports = router;