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

router.get('/projects/excel', function(req, res, next){

//console.log('test');

//res.send('test');
try{
  var workSheetsFromFile = xlsx.parse(`../public/moj_excel.xls`);
   res.json({status:'OK', excel: workSheetsFromFile});
 }catch(error){
  res.json({status:'error',message:error});
 }



/*
  var parseXlsx = require('excel');
  parseXlsx('../public/arkusz_biqmap.xlsx', function(err, data) {
    if(err) throw err;
      res.json(data);
      console.log(data);
  });
*/
});



//CRUD zapisujemy nową mapę do bazy
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

   
   //res.json({path: temp_path, name : file_name});

  });




/*
 form.on('end', function(fields, files) {

        var temp_path = this.openedFiles[0].path;
        /* The file name of the uploaded file 
        var file_name = this.openedFiles[0].name;
  });

        //console.log( temp_path, file_name );

var temp_path = this.openedFiles[0].path;
    var parseXlsx = require('excel');
    parseXlsx(temp_path, function(err, data) {
      if(err) throw err;
        res.json(data);
        console.log(data);
    });


/*
excelParser.worksheets({
  inFile: temp_path
}, function(err, worksheets){
  if(err) console.error(err);
  console.log(worksheets);
  res.json( worksheets );
});

*/
/*
    //sprawdzamy co wiemy o danym pliku excel
    console.log(file.size, );

    var parseXlsx = require('excel');
    parseXlsx(file.path, function(err, data) {
      if(err) throw err;
        res.json(data);
        console.log(data);
    });*/

  
  //console.log(file);
  //res.json({'file_name' : file.name });

});



router.get('/projects',logged, function(req, res, next) {
  var data = { login: req.session.login, id: req.session.id};
  res.render('projects',data);
});

module.exports = router;