var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  project: String,
  _page: String,
  _reportServerTime: Number
}, {autoIndex: false});
module.exports = schema;
