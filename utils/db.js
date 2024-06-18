const mysql = require('mysql2')

const db = mysql.createPool({
  // 本地
  host:'127.0.0.1',
  user:'root',
  password:'root123456',
  database:'zimaspace_manage',
  //线上
  // host:'localhost',
  // user:'manage.icewhale',
  // password:'ef4ThfzKSPGHTSJX',
  // database:'manage.icewhale',
})

// 测试数据库连接
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
  connection.release();
});

module.exports = db;