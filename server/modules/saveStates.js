var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
app.use( bodyParser.json() );
var router = express.Router();

var sha1 = require('sha-1');

var BoardState = require('./boardstate_model.js');


router.post('/', function(req, res){
  console.log("In /saveStates");
  console.log(req.body);

    var newStates = new BoardState({
      allStates: req.body.allStates,
      info: req.body.info
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
