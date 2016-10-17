var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var maps = require('./routes/maps');
var projects = require('./routes/projects');
var embed = require('./routes/embed');
var session = require('express-session')

var app = express();

app.use(session({ secret: '$#%!@#@@#SSDASASDVV@@@@', cookie: { maxAge: 12000000 }, resave: true, saveUninitialized: true }))

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());


//obsługa routingu
app.use('/', express.static( path.join(__dirname, 'public')) );

app.use('/', maps);
app.use('/', projects);
app.use('/', routes);
app.use('/', embed);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}


app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;