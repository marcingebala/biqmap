var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var Mp4Convert = require('mp4-convert');
var ffmpeg = require('fluent-ffmpeg');
var url = 'mongodb://localhost:27017/biqmap';
var xss = require('xss');
var sha1 = require('sha1');

//wyświetlenie strony indeksowej
router.get('/embed/:id', function(req, res, next) {
  res.render('embed', { id : req.params.id });
});

module.exports = router;