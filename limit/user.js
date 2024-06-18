const joi = require('joi')

// string值只能为字符串
// alphanum值为a-z A-Z 0-9
// min是最小长度 max是最大长度
// required是必填项
// pattern是正则

const id = joi.required()
const name = joi.string().pattern(/^[\u4E00-\u9FA5]{2,10}(·[\u4E00-\u9FA5]{2,10}){0,2}$/).required()
const email = joi.string().pattern(/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(.[a-zA-Z0-9_-]+)+$/).required()
const oldPassword = joi.string().pattern(/^(?![0-9]+$)[a-z0-9]{1,50}$/).min(6).max(12).required()
const newPassword = joi.string().pattern(/^(?![0-9]+$)[a-z0-9]{1,50}$/).min(6).max(12).required()

exports.password_limit ={
	// 表示对req.body里面的数据进行验证
	body:{
		id,
		oldPassword,
		newPassword
	}
}

exports.name_limit ={
	// 表示对req.body里面的数据进行验证
	body:{
		id,
		name
	}
}

exports.email_limit ={
	// 表示对req.body里面的数据进行验证
	body:{
		id,
		email
	}
}

exports.forgetPassword_limit ={
	// 表示对req.body里面的数据进行验证
	body:{
		id,
		newPassword
	}
}