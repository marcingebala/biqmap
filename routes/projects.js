var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var Mp4Convert = require('mp4-convert');
var ffmpeg = require('fluent-ffmpeg');
var url = 'mongodb://localhost:27017/biqmap';
var xss = require('xss');
var sha1 = require('sha1');

//middleware sprawdzający czy użytkownik jest zalogowany
var logged_api = function (req, res, next) {
  if ( req.session.login != undefined){
    next();
  } 
  else{
    res.json({status:'error','message':'brak dostępu do danych - zaloguj się'});
  }
}

var logged = function (req, res, next) {
  if( req.session.login != undefined ){
    next();
  } 
  else{
    res.redirect('/');
  }
};

router.get('/projects',logged, function(req, res, next) {
  var data = { login: req.session.login, id: req.session.id};
  res.render('projects',data);
});

module.exports = router;