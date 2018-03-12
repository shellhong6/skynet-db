const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
const Base = require('./base.js');

var schema = new Schema(Object.assign({
  ce: Number,
  cs: Number,
  dc: Number,
  dcle: Number,
  dcls: Number,
  di: Number,
  dl: Number,
  dle: Number,
  dls: Number,
  fs: Number,
  le: Number,
  ls: Number,
  ns: Number,
  re: Number,
  rs: Number,
  reqs: Number,
  reqe: Number,
  rese: Number,
  ress: Number,
  scs: Number,
  uee: Number,
  ues: Number,
  end: Number,
  _search: String
}, Base), {autoIndex: false});
module.exports = schema;
