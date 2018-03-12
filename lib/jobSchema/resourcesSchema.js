var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  type: String,
  name: String,
  dur: Number,
  amount: Number,
  _page: String,
  _reportServerTime: Number
}, {autoIndex: false});
module.exports = schema;
