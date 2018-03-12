var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  name: String,
  emails: String,
  owner: {type: String, default: 'anyone'},
  errorAmount: {type: Number, default: 0},
  bigMemoryAmount: {type: Number, default: 0},
  slowTimingAmount: {type: Number, default: 0},
  _reportServerTime: Number
}, {autoIndex: false});
module.exports = schema;
