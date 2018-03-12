var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  name: String,
  password: String,
  role: String
}, {autoIndex: false});
module.exports = schema;
