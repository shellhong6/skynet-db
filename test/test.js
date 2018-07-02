const Mongoose = require('mongoose');

var dbName = 'test2';
var url = `mongodb://127.0.0.1:27017/${dbName}`;

var con = Mongoose.createConnection(url, {});

con.on('error', function(err){
  console.log('error')
});
con.on('connected', function(){
  console.log('connected');
  con.dropDatabase(function(){
    console.log(arguments);
  });
});
