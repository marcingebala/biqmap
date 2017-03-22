var express = require('express');
var app = express();

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session')
var router = express.Router();

var mysql = require('mysql2');
var connection = mysql.createConnection({host:'localhost', user: 'root',password: '123', database: 'biqmap_db'});
 
var routes = require('./routes/index');
var maps = require('./routes/maps');
var projects = require('./routes/projects');
var embed = require('./routes/embed');


app.use(session({ secret: '$#%!@#@@#SSDASASDVV@@@@', cookie: { maxAge: 2*24*60*60*1000 }, resave: true, saveUninitialized: true }))

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

router.get('/:x', function(req, res, next) {
  res.send('done');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.redirect('/');
  //var err = new Error('Not Found');
  //err.status = 404;
  //next(err);
});

if (process.env.MODE === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

/*
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
*/
module.exports = app;