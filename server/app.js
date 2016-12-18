var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var urlencodedParser=bodyParser.urlencoded( { extended: false } );

var db = require('../server/modules/connection.js');

app.use( bodyParser.json() );
app.use( express.static( 'public' ) );


app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log('Server up:', app.get('port'));
});


app.get( '/', function( req, res ){
  console.log( 'Home base' );
  res.sendFile( path.resolve( 'public/views/home.html' ) );
});


app.get( '/new', function( req, res ){
  console.log( 'Board State Creation' );
  res.sendFile( path.resolve( 'public/views/index.html' ) );
});


var saveStates = require ('../server/modules/saveStates.js');
var boardStates = require ('../server/modules/boardStates.js');
var homeData = require ('../server/modules/homeData.js');

app.use('/saveStates', saveStates);
app.use('/boardStates', boardStates);
app.use('/homeData', homeData);
