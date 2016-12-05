var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boardStateSchema = new Schema({
    allStates: [{
      stateNumber: Number,
      createdCardArray: Array,
      gameStats: {}
    }],
    hashed_id: String
  });

  module.exports = mongoose.model('BoardState', boardStateSchema);
