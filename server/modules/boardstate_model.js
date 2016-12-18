var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var boardStateSchema = new Schema({
    allStates: [{
      stateNumber: Number,
      createdCardArray: Array,
      gameStats: {}
    }],
    hashed_id: String,
    info: {
      title: String,
      username: String,
      category: String,
      description: String,
      popularity: {type: Number, default: 0},
      date: {type: Date, default: Date.now}
    }
  });

  module.exports = mongoose.model('BoardState', boardStateSchema);
