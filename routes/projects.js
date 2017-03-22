var express = require('express'),
    router = express.Router(),
    mongodb = require('mongodb'),
    mongourl = process.env.MONGO_URL,
    empty = require('empty-value'),
    mysql = require('mysql2'),
    randomstring = require("randomstring");

var connection = mysql.createConnection({host:process.env.DB_HOST, user:process.env.DB_USER,password:process.env.DB_PASSWORD, database:process.env.DB_DATABASE});

//var mongourl = 'mongodb://biqmap:poiuy@mongo-biqmap01.gazeta.pl:27017';

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

router.get('/api/projects/test', function(req, res, next) {

  res.send( randomstring.generate(24) );

});


//CRUD CREATE tworzymy nowy projekt 
router.post('/api/projects/',logged_api, function(req, res, next) {
  
  //wygenerowanie hasha i sprawdzenie czy jest indywidualny
  var generateHash = function() {
    var hash = randomstring.generate(24);
    connection.query("SELECT * FROM maps WHERE hash ='"+hash+"' ", function (error, results, fields) {
      if(empty(results)){
        saveMap(hash);
      }
      else {
        generateHash();
      }
    });
  }

  //zapis mapy do bazy
  var saveMap = function(hash){
    connection.query("INSERT INTO projects (user_id, map_json, hash, map_hash, layers, excel, project) VALUES ('"+req.session.id_user+"','"+req.body.map_json+"','"+hash+"','"+req.body.map_hash+"','"+req.body.layers+"','"+req.body.excel+"','"+req.body.project+"')", function (error, results, fields) { res.json( {status: 'ok', hash_map: results.insertId} ); });
  }
  
  generateHash()


  //tworzymy nowy projekt
  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('projects');
    collection.insert({ id_user : req.session.id_user, map_hash : req.body.map_hash , map_json : req.body.map_json, layers : req.body.layers, excel : req.body.excel, project : req.body.project }, function(err,docs){
      res.json( {status: 'ok', project_hash: docs.ops[0]._id} );
    });  
    db.close();  
  });*/
});


//CRUD UPDATE aktualizujemy już istniejacy projekt
router.put('/api/projects', logged_api, function(req, res, next){

  connection.query('UPDATE projects SET map_json=\''+req.body.map_json+'\', layers=\''+req.body.layers+'\', excel=\''+req.body.excel+'\', project=\''+req.body.project+'\' WHERE user_id="'+req.session.id_user+'" AND hash="'+req.body.hash+'"' , function (error, results, fields) {
    res.json( {status: 'ok', message: 'zaktualizowano mapę'} );
  });

  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('projects');
    collection.update({_id: mongodb.ObjectId(req.body.project_hash)}, {  $set: {map_hash : req.body.map_hash , map_json : req.body.map_json, layers : req.body.layers, excel : req.body.excel, project : req.body.project} }, function(err,docs){
      res.json( {status: 'ok', message: 'zakutalizowano mapę'} );
    });  
    db.close();  
  });*/
});


//CRUD zwracamy jsona z wszystkimi projektami użytkownika
router.get('/api/projects/',logged_api, function(req, res, next) {

  connection.query("SELECT hash, project FROM projects WHERE user_id='"+req.session.id_user+"'", function (error, results, fields) {
    res.json( {status: 'ok',data : results} );
  });

  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('projects');
    collection.find({ id_user : req.session.id_user },{project:1}).toArray(function(err, docs) {
      res.json( {status: 'ok',data : docs} );
    });
    db.close();
  });*/

});


//CRUD DELETE usuwamy projekt z bazy
router.delete('/api/project/:id',logged_api, function(req, res, next) {

  connection.query("DELETE FROM projects WHERE user_id='"+req.session.id_user+"' AND hash='"+req.params.id+"'", function (error, results, fields) {
    res.json( { status : 'ok' } );
  }); 

/*
  mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('projects');
    collection.deleteOne({ id_user : req.session.id_user, _id: mongodb.ObjectId(req.params.id) }, function(err, docs) {
      res.json( {status: 'ok' } );
    });
    db.close();
  });*/

});

//CRUD GET pobieramy konkretny projekt
router.get('/api/project/:id', function(req, res, next) {

  connection.query("SELECT * FROM projects WHERE hash='"+req.params.id+"'", function (error, results, fields) {  
    if(empty(results)){
      res.json( {status : 'error', message : 'brak projektu'} );
    }
    else{
      res.json( {status : 'ok',data : results[0]} );
    }
  });

  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('projects');
    //do pobrania mapy potrzebujemy 2 zmiennyd id_user oraz params.id
    collection.find({ _id: mongodb.ObjectId(req.params.id) }).toArray(function(err, docs) { 
      if(docs.length){
        res.json( {status: 'ok',data : docs[0]} );
      }
      else{
        res.json( {status: 'error', message: 'brak projektu'} );
      }
    });
    db.close();
  });*/

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