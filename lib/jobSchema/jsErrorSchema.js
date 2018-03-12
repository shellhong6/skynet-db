var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  message: String,
  name: String,
  stack: String,
  solve: {type: Boolean, default: false},
  amount: {type: Number, default: 1, index: true},
  _reportServerTime: {type: Number, default: 0},
  _page: String
}, {autoIndex: false});
module.exports = schema;
