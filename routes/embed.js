var express = require('express'),
    router = express.Router(),
    mongodb = require('mongodb'),
    mongourl = process.env.MONGO_URL,
    Mp4Convert = require('mp4-convert'),
    ffmpeg = require('fluent-ffmpeg'),
    xss = require('xss'),
    sha1 = require('sha1');

//wyświetlenie strony indeksowej
router.get('/embed/:id', function(req, res, next) {
  res.render('embed', { id : req.params.id });
});

module.exports = router;