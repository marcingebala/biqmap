var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var Mp4Convert = require('mp4-convert');
var ffmpeg = require('fluent-ffmpeg');
var url = 'mongodb://localhost:27017/biqmap';
var xss = require('xss');
var sha1 = require('sha1');
var formidable = require('formidable');
//var excelParser = require('excel-parser');
var xlsx = require ('node-xlsx');


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


//CRUD CREATE tworzymy nowy projekt 
router.post('/api/projects/',logged_api, function(req, res, next) {
  //tworzymy nowy projekt
  mongodb.connect(url, function(err, db) {
    var collection = db.collection('projects');
    collection.insert({ id_user : req.session.id_user, data : req.body.data }, function(err,docs){
      res.json( {status: 'ok', hash_map: docs.ops[0]._id} );
    });  
    db.close();  
  });
});


//CRUD zwracamy jsona z wszystkimi projektami użytkownika
router.get('/api/projects/',logged_api, function(req, res, next) {

  mongodb.connect(url, function(err, db) {
    
    var collection = db.collection('projects');

    collection.find({ id_user : req.session.id_user }).toArray(function(err, docs) {
      res.json( {status: 'ok',data : docs} );
    });
    
    db.close();
  
  });

});


//PARSUJEMY EXCELA
router.post('/api/projects/excel_parse',logged_api, function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req);
    
  //wyświetlamy progress przesyłanego pliku
  form.on('progress', function(bytesReceived, bytesExpected) {
    console.log(bytesReceived, bytesExpected)
  });

  form.on('end', function() {
    
    var temp_path = this.openedFiles[0].path;
    var file_name = this.openedFiles[0].name;

    try{
      var workSheetsFromFile = xlsx.parse(temp_path);
      res.json({status:'OK', excel: workSheetsFromFile});
    }catch(error){
      res.json({status:'error',message:error});
    }
  });
});


//ZWRACAMY GŁÓWNY WIDOK PROJEKTU
router.get('/projects',logged, function(req, res, next) {
  var data = { login: req.session.login, id: req.session.id};
  res.render('projects',data);
});

module.exports = router;