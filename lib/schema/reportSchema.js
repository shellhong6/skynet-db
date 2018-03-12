const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Base = require('./base.js');

var schema = new Schema(Object.assign({
  baseInfo: String,
  otherInfo: String
}, Base), {autoIndex: false});
module.exports = schema;
