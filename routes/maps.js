var express = require('express'),
    router = express.Router(),
    mongodb = require('mongodb'),
    mongourl = process.env.MONGO_URL,
    Mp4Convert = require('mp4-convert'),
    ffmpeg = require('fluent-ffmpeg'),
    xss = require('xss'),
    sha1 = require('sha1'),
    formidable = require('formidable'),
    empty = require('empty-value'),
    mysql = require('mysql2'),
    randomString = require('random-string');

var connection = mysql.createConnection({host:process.env.DB_HOST, user:process.env.DB_USER,password:process.env.DB_PASSWORD, database:process.env.DB_DATABASE});

//middleware sprawdzający czy użytkownik jest zalogowany
var logged_api = function (req, res, next) {
  if ( req.session.login != undefined) {
    next();
  } 
  else {
    res.json({status:'error','message':'brak dostępu do danych - zaloguj się'});
  }
}


//sprawdzamy czy uzytkownik jest zalogowany a jeśli nie to go przekierowujemy na stronę logowania (jesli to nie jest zapytanie)
var logged = function (req, res, next) {
  if( req.session.login != undefined ){
    next();
  } 
  else{
    res.redirect('/');
  }
};


//zwracamy stronę do logowania z mapą dla użytkownika
router.get('/maps',logged, function(req, res, next) {
  var data = { login: req.session.login, id: req.session.id};
  res.render('maps',data);
});


//CRUD ALL-GET zwracamy jsona z wszystkimi mapami użytkownika
router.get('/api/maps/',logged_api, function(req, res, next) {
  
  console.log('req id',req.session.id_user);
  
  connection.query("SELECT * FROM maps WHERE user_id='"+req.session.id_user+"'", function (error, results, fields) {
    res.json( {status: 'ok',data : results} );
  });

  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('maps');
    collection.find({ id_user : req.session.id_user }).toArray(function(err, docs) {
    	res.json( {status: 'ok',data : docs} );
    });
    db.close();
  });*/

});


//CRUD UPDATE aktualizujemy już istniejacą mapę
router.put('/api/maps', logged_api, function(req, res, next){

  connection.query('UPDATE maps SET map_json=\''+req.body.map_json+'\' WHERE user_id="'+req.session.id_user+'" AND map_hash="'+req.body.map_hash+'"' , function (error, results, fields) {
    res.json( {status: 'ok', message: 'zakutalizowano mapę'} );
  });

  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('maps');
 		collection.update({_id: mongodb.ObjectId(req.body.map_hash)}, {  $set: {map_json : req.body.map_json} }, function(err,docs){
    	res.json( {status: 'ok', message: 'zakutalizowano mapę'} );
    });  
    db.close();  
  });
*/
});


//CRUD CREATE zapisujemy nową mapę do bazy
router.post('/api/maps/',logged_api, function(req, res, next) {

  //wygenerowanie hasha i sprawdzenie czy jest indywidualny
  var generateHash = function() {
    var hash = randomString();
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
    connection.query("INSERT INTO maps (user_id, map_json, map_hash) VALUES ('"+req.session.id_user+"','"+req.body.map_json+"','"+hash+"')", function (error, results, fields) { res.json( {status: 'ok', hash_map: hash} ); });
  }
  
  generateHash()

  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('maps');
 		collection.insert({ id_user : req.session.id_user, map_json : req.body.map_json }, function(err,docs){
    	res.json( {status: 'ok', hash_map: docs.ops[0]._id} );
    });  
    db.close();  
  });*/

});


//CRUD GET pobieramy konkretną mapę
router.get('/api/map/:id',logged, function(req, res, next) {
  
  connection.query("SELECT * FROM maps WHERE user_id='"+req.session.id_user+"' AND map_hash='"+req.params.id+"'", function (error, results, fields) {
    
    if(empty(results)){
      res.json( {status : 'error', message : 'brak mapy lub mapa niezgodna z użytkownikiem'} );
    }
    else{
      res.json( {status : 'ok',data : results} );
    }
  
  });

  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('maps');
		//do pobrania mapy potrzebujemy 2 zmiennyd id_user oraz params.id
    collection.find({ id_user: req.session.id_user, _id: mongodb.ObjectId(req.params.id) }).toArray(function(err, docs) {
    	
			if(docs.length){
				res.json( {status: 'ok',data : docs} );
			}
			else{
				res.json( {status: 'error', message: 'brak mapy lub mapa niezgodna z użytkownikiem'} );
			}
		
    });
    db.close();
  });*/
});

//CRUD DELETE usuwamy projekt z bazy
router.delete('/api/map/:id',logged_api, function(req, res, next) {
  
  connection.query("DELETE FROM maps WHERE user_id='"+req.session.id_user+"' AND map_hash='"+req.params.id+"'", function (error, results, fields) {
    res.json( { status : 'ok' } );
  }); 


  /*mongodb.connect(mongourl, function(err, db) {
    var collection = db.collection('maps');
    collection.deleteOne({ id_user : req.session.id_user, _id: mongodb.ObjectId(req.params.id) }, function(err, docs) {
      res.json( {status: 'ok' } );
    });
    db.close();
  });*/

});

module.exports = router;