const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Base = require('./base.js');


var schema = new Schema(Object.assign({
  message: String,
  name: String,
  stack: String,
  solve: {type: Boolean, default: false}
}, Base), {autoIndex: false});
module.exports = schema;
