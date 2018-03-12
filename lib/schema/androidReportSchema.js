const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Base = require('./base.js');

var schema = new Schema(Object.assign({
  project: String,
  apiName: String,
  message: String,
  stack: String
}, Base), {autoIndex: false});
module.exports = schema;
