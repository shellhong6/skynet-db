var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  message: String,
  apiName: String,
  stack: String,
  amount: {type: Number, default: 1, index: true},
  _reportServerTime: {type: Number, default: 0},
  project: String
}, {autoIndex: false});
module.exports = schema;
