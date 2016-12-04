
var mongoose = require('mongoose');
var connectionString;

if(process.env.MONGODB_URI !== undefined){
  connectionString = process.env.MONGODB_URI;
} else {
  connectionString = 'localhost:27017/boardState';
}

mongoose.connect(connectionString);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;
