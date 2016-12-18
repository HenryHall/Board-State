
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var sha1 = require('sha-1');

var BoardState = require('./boardstate_model.js');


router.get('/:boardStateId', function(req, res){

  var boardStateId = req.params.boardStateId;
  console.log("in /boardStates with:", boardStateId);

  // Find the boardState by Id
  BoardState.findOneAndUpdate(
    {hashed_id: boardStateId},
    {$inc: {"info.popularity": 1} },
    {new: true},
    function(err, doc){
      if(err || doc == null){
        console.log("Oops", err);
        res.sendStatus(204);
      } else {
        console.log(doc);
        res.send(doc);
      }
    }
  );


});



module.exports = router;
