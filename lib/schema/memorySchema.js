const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Base = require('./base.js');

var schema = new Schema(Object.assign({
  limit: Number,
  total: Number,
  used: Number
}, Base), {autoIndex: false});
module.exports = schema;
