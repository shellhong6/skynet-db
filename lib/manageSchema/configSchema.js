var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  name: String,
  detail: String
}, {autoIndex: false});
module.exports = schema;
