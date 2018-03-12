var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  amount: {type: Number,default:1},
  _page: String,
  _reportServerTime: Number
}, {autoIndex: false});
module.exports = schema;
