const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

var schema = new Schema({
  _page: String,
  _imei: String
}, {autoIndex: false});
module.exports = schema;
