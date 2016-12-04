
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var sha1 = require('sha-1');


var boardStateSchema = mongoose.Schema({
    allStates: [{
      stateNumber: Number,
      createdCardArray: Array,
      gameStats: {}
    }],
    hashed_id: String
  });

var BoardState = mongoose.model('BoardState', boardStateSchema);


router.get('/:boardStateId', function(req, res){

  var boardStateId = req.params.boardStateId;
  console.dir(boardStateId);
  console.log("in /boardStates with:", boardStateId);

  // Find the boardState by Id
  BoardState.findOne({hashed_id: boardStateId})
  .then(function(data){
    res.send(data);
    console.log("data", data);
  });


});



module.exports = router;
