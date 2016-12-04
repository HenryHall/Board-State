var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded( { extended: false } );

var db = require('../server/modules/connection.js');

app.use( bodyParser.json() );
app.use( express.static( 'public' ) );

app.get( '/', function( req, res ){
  console.log( 'Home base' );
  res.sendFile( path.resolve( 'public/views/index.html' ) );
});

app.get('/states', function(req,res){
  // console.log( 'loading state:',  req.params.state);
  res.sendFile( path.resolve( 'public/views/loadStates/viewState.html' ) );

});


app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log('Server up:', app.get('port'));
});


var saveStates = require ('../server/modules/saveStates.js');
var boardStates = require ('../server/modules/boardStates.js');

//Used for saving
app.use('/saveStates', saveStates);

app.use('/boardStates', boardStates);
