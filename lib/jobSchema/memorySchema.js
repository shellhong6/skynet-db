var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  limit: Number,
  total: Number,
  used: Number,
  _reportServerTime: Number,
  _page: String
}, {autoIndex: false});
module.exports = schema;
