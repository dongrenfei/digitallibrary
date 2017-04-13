var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var session = require('express-session');

var db = require('./models/db');
var log = require('./models/log');
var domain = require('domain');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, './app/views'));

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'app')));

app.use(session({
  secret: 'elevenlibrary', // 建议使用 128 个字符的随机字符串
  cookie: {
    maxAge: 24* 60 * 60 * 1000
  },
  rolling: true,
  saveUninitialized: true,
  resave: false
}));

app.use(function(req, res, next) {
  var views = req.session.views;
  next();
})


app.use(function(req, res, next) {
  var reqDomain = domain.create();
  reqDomain.on('error', function(error) {
    log.create({
      url: req.originalUrl,
      req: req.body,
      err: error.stack
    });
    fs.appendFile('log.log', Date() + ' | ' + req.originalUrl + ' | ' + JSON.stringify(req.body) + ' | ' + error.stack + '\n');
    console.log("Error req:", req.originalUrl, req.body, error.stack);
    res.status(500).send(error.stack);
  });
  reqDomain.run(next);
});

require('./routes/user')(app);
require('./routes/book')(app);
require('./routes/userBook')(app);
require('./routes/adminBook')(app);
require('./routes/borrowBook')(app);
require('./routes/log')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
