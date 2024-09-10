var express = require('express');
var router = express.Router();

const expressJoi = require('@escook/express-joi');
const { login_limit } = require('../limit/login');
// 导入bcrypt加密中间件
const bcrypt = require('bcryptjs')
// 导入jwt,用于生成token
const jwt = require('jsonwebtoken')
// 导入jwt配置文件，用于加密跟解密
const jwtconfig = require('../utils/jwt_config.js')


const db = require('../utils/db');
const table = 'users';


router.post('/login',expressJoi(login_limit),(req, res) => {
  const loginfo = req.body
  // 第一步 查看数据表中有没有前端传过来的账号
  const sql = `select * from ${table} where account = ?`
  db.query(sql, loginfo.account, (err, results) => {
      // 执行sql语句失败的情况 一般在数据库断开的情况会执行失败
      if (err) res.err(err)
      if (results.length !== 1) return res.err('账号或密码错误')
      // 第二步 对前端传过来的密码进行解密
      const compareResult = bcrypt.compareSync(loginfo.password, results[0].password)
      if (!compareResult) {
          return res.err('登录失败')
      }
      // 第三步 对账号是否冻结做判定
      if (results[0].status == 0) {
          return res.err('账号被冻结')
      }
      // 第四步 生成返回给前端的token
      // 剔除加密后的密码,头像,创建时间,更新时间
      const user = {
          ...results[0],
          password: '',
          imageUrl: '',
          create_time: '',
          update_time: '',
      }
      // 设置token的有效时长 有效期为7个小时
      const tokenStr = jwt.sign(user, jwtconfig.jwtSecretKey, {
          expiresIn: '7h'
      })
      res.send({
          results: user,
          status: 200,
          message: '登录成功',
          token: 'Bearer ' + tokenStr,
      })
  })
})

router.post('/register',expressJoi(login_limit), (req, res) => {
  // req是前端传过来的数据,也就是request,res是返回给前端的数据,也就是response
  const reginfo = req.body
  // 第一步,判断前端传过来的数据有没有空
  if (!reginfo.account || !reginfo.password) {
      return res.send({
          status: 1,
          message: '账号或者密码不能为空'
      })
  }
  // 第二步,判断前端传过来账号有没有已经存在在数据表中
  // 需要使用mysql的select语句
  const sql = 'select * from users where account = ?'
  // 第一个参数是执行语句，第二个是参数，第三个是一个函数，用于处理结果
  db.query(sql, reginfo.account, (err, results) => {
      if (results.length > 0) {
          return res.send({
              status: 1,
              message: '账号已存在'
          })
      }
      // 第三步,对密码进行加密
      // 需要使用加密中间件 bcrypt.js
      // bcrypt.hashSyncd第一个参数是传入的密码，第二个参数是加密后的长度
      reginfo.password = bcrypt.hashSync(reginfo.password, 10)
      // 第四步,把账号跟密码插入到users表里面
      const sql1 = 'insert into users set ?'
      // 注册身份
      const identity = '用户'
      // 创建时间
      const create_time = new Date()
      console.log(reginfo)
      db.query(sql1, {
          account: reginfo.account,
          password: reginfo.password,
          name: reginfo.name,
          email: reginfo.account,
          // 身份
          identity,
          // 创建时间
          create_time,
          // 初始有效状态为1
          status: 1,
      }, (err, results) => {
          // 第一个,插入失败
          // affectedRows为影响的行数，如果插入失败，那么就没有影响到行数，也就是行数不为1
          if (results.affectedRows !== 1) {
              return res.send({
                  status: 1,
                  message: '注册账号失败'
              })
          }
          res.send({
              status: 200,
              message: '注册账号成功'
          })
      })
  })
})




module.exports = router;