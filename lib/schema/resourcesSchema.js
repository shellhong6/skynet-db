const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Base = require('./base.js');

var schema = new Schema(Object.assign({
  list: String
}, Base), {autoIndex: false});
module.exports = schema;
