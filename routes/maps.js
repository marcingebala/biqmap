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


//zwracamy stronę do logowania z mapą dla użytkownika
router.get('/maps',logged, function(req, res, next) {
  var data = { login: req.session.login, id: req.session.id};
  res.render('maps',data);
});


//CRUD zwracamy jsona z wszystkimi mapami użytkownika
router.get('/api/maps/',logged_api, function(req, res, next) {

  mongodb.connect(url, function(err, db) {
    
    var collection = db.collection('maps');

    collection.find({ id_user : req.session.id_user }).toArray(function(err, docs) {
    	res.json( {status: 'ok',data : docs} );
    });
    
    db.close();
  
  });

});

router.put('/api/maps', logged_api, function(req, res, next){

  //tworzymy nowego użytkownika
  mongodb.connect(url, function(err, db) {
    
    var collection = db.collection('maps');
    
    console.log( req.body  );

 		collection.update({_id: mongodb.ObjectId(req.body.map_hash)}, {  $set: {map_json : req.body.map_json} }, function(err,docs){
    	res.json( {status: 'ok', message: 'zakutalizowano mapę'} );
    });  
    
    db.close();  

  });

});

//CRUD zapisujemy nową mapę do bazy
router.post('/api/maps/',logged_api, function(req, res, next) {

  //tworzymy nowego użytkownika
  mongodb.connect(url, function(err, db) {
    
    var collection = db.collection('maps');
    
    console.log( req.body  );

 		collection.insert({ id_user : req.session.id_user, map_json : req.body.map_json }, function(err,docs){
    	res.json( {status: 'ok', hash_map: docs.ops[0]._id} );
    });  
    
    db.close();  

  });

});


//CRUD pobieramy konkretną mapę
router.get('/api/maps/:id',logged, function(req, res, next) {

  mongodb.connect(url, function(err, db) {
    
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
  
  });

});

module.exports = router;