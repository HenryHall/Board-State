var express= require('express');
var app= express();
var path = require('path');


app.use( express.static( 'public' ) );

app.get( '/', function( req, res ){
  console.log( 'Home base' );
  res.sendFile( path.resolve( 'public/views/index.html' ) );
});


app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'), function() {
  console.log('Server up:', app.get('port'));
});
