var createError = require('http-errors');
var express = require('express');
var path = require('path');
const fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpecs } = require('./utils/swagger');

// 路由文件
const indexRouter = require('./routes/index');
const galleryRouter = require('./routes/gallery');
const uploadRouter = require('./routes/upload');
const docsRouter = require('./routes/docs');
const eventRouter = require('./routes/event');
const searchRouter = require('./routes/search');



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/static',express.static(path.join(__dirname, 'public')));
// app.use('/api/static',express.static('./public'));
app.use('/api/getImage/:name',(req,res)=>{
  let {name} = req.params;
  fs.readFile(path.join(__dirname, 'public/images/'+name), function (err, content) {
    if (err) {
        res.writeHead(400)
        console.log(err);
        res.end("No such image");
    } else {
        //specify the content type in the response will be an image
        res.writeHead(200);
        res.end(content);
    }
});
  // res.sendFile(path.join(__dirname, 'public/images'+req.query.name))
})


// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use((req, res, next) => {
	// status=0为成功,=1为失败,默认设为1,方便处理失败的情况
  res.cc = (data, status = 200) => {
		res.send({
			status,
      data,
		})
	}
	res.err = (err, status = 500) => {
    console.log(err)
		res.send({
			status,
			// 判断这个error是错误对象还是字符串
			message: err instanceof Error ? err.message : err,
		})
	}
	next()
})



app.use('/api/search', searchRouter);

// 这里开始接口需要验证token
app.use('/api/auth', require('./routes/auth'))
// 添加token验证 用户信息绑定在 req.auth
const jwtconfig = require('./utils/jwt_config.js')
const {
  expressjwt: jwt
} = require('express-jwt')
app.use(jwt({
  secret:jwtconfig.jwtSecretKey,algorithms:['HS256']
}).unless({
  // 添加不需要验证的接口
  path:['/api/gallery/list','/api/feedback/add','/api/share/data']
}))

app.use('/api/upload', uploadRouter);
app.use('/api/docs', docsRouter)
app.use('/api/event', eventRouter)
app.use('/api/gallery', galleryRouter);
app.use('/api/feedback', require('./routes/feedback'))
app.use('/api/share', require('./routes/share'))

//全局中间件
app.use(function (err, req, res, next) {
	if (err.name === "UnauthorizedError") {
		res.send({
			status:401,
			message:'无效的Token',

		})
	}
	res.send({
			status:500,
			message:'未知的错误',
		}
	)
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
