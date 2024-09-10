const joi = require('joi')

// string值只能为字符串
// alphanum值为a-z A-Z 0-9
// min是最小长度 max是最大长度
// required是必填项
// pattern是正则

// 账号的验证
const account = joi.string().min(6).max(40).required()
// 密码的验证
const password = joi.string().min(6).required()
const name = joi.string().min(3).max(20)

exports.login_limit ={
	// 表示对req.body里面的数据进行验证
	body:{
		account,
		password,
    name
	}
}