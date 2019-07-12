var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');//类似解析cookie,在这里做成插件
var logger = require('morgan');//自动生成日志
const session = require('express-session')

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
const blogRouter = require('./routes/blog');
const userRouter = require('./routes/user');

var app = express();//初始化app ，本次http请求的实例

//注册视图引擎的设置，前端页面
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

//app.use指当前请求访问后的使用以下组件
// app.use(logger('dev'));//写日志
// app.use(express.json());//相当于post Data.如果有post请求传入数据，里面可以直接在路由里面通过req.body把这个数据回导
app.use(express.urlencoded({ extended: false }));//除了json,兼容其他的格式
app.use(cookieParser());//通过这个插件的处理，能够req.cookies快速的访问所有的cookie
// app.use(express.static(path.join(__dirname, 'public')));//前端

app.use(session({
  secret:'Wjhfs#4542',//密匙
  cookie:{
    path: '/',//默认配置
    httpOnly: true,//默认配置
    maxAge:24*60*60*1000
  }
}))

//处理路由,前面是父路由，后面是到路由的文件
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/api/blog',blogRouter);
app.use('/api/user',userRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {//访问的路径没有在处理路由的范围之内，返回404
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};//本地开发抛出来的问题

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
