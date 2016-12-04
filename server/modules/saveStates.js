var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
app.use( bodyParser.json() );
var router = express.Router();

var sha1 = require('sha-1');


var boardStateSchema = mongoose.Schema({
    allStates: [{
      stateNumber: Number,
      createdCardArray: Array,
      gameStats: {}
    }],
    hashed_id: String
  });

router.post('/', function(req, res){
  console.log("In /saveStates");

  var BoardState = mongoose.model('BoardState', boardStateSchema);

    var newStates = new BoardState({
      allStates: req.body
    });

    var newHashedId;

    newStates.save(function(err){
      if (err) {return console.error(err);}
    })
    .then(function(){


      newHashedId = sha1(newStates._id.toString());

      BoardState.update(
        {_id: newStates._id.toString()},
        { $set: {hashed_id: newHashedId}}
      )
      .then(function(err){
        if (err) {console.log(err);}
        res.send(newHashedId);
      });
    });

});


module.exports = router;
