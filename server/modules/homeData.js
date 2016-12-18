
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var BoardState = require('./boardstate_model.js');

router.get('/', function(req,res){

  var query = {newest: undefined, popular: undefined};
  BoardState.find({}, {hashed_id: 1, info: 1}).sort({$natural: -1}).limit(5)
  .then(function(recentData){
    query.newest = recentData;

    BoardState.find({}, {hashed_id: 1, info: 1}).sort({popularity: 1}).limit(5)
    .then(function(popularityData){
      query.popular = popularityData;
      res.send(query);
    });

  });

});


module.exports = router;
