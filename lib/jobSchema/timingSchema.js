var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  readyStart: Number,//浏览器准备时间
  net: Number,//网络用时(域名查找，建立连接，获取请求)
  load: Number,//load时间
  other: Number,//load事件发生后，额外的时间
  _reportServerTime: Number,
  _page: String
}, {autoIndex: false});
module.exports = schema;
