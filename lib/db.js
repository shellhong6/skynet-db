var Mongoose = require('mongoose');
const Async = require('async');
const Schedule = require('node-schedule');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');
const Config = require('./config.js');

const ONE_DAY_MS = 864e5;

const FREQUENT_OPTIONS = {//兼容两种版本
  socketTimeoutMS: 0,
  keepAlive: 1,
  connectTimeoutMS: 3e4,
  autoReconnect: true,
  auto_reconnect: true,
  poolSize: 10,
  user: Config.user,
  pass: Config.pass
};

var g_options = FREQUENT_OPTIONS;
var g_dbName = Config.dbName;
var g_type = '';

// 数据库连接获取逻辑
var connections = {};
var getExitConnection = function(database, time){
  var conInfo = connections[database];
  if(!conInfo){
    return null;
  }
  conInfo.time = time;
  return conInfo.con;
}
var setExitConnection = function(con, database, time){
  return connections[database] = {
    con: con,
    time: time
  };
}
var getConnection = function(database, successFn){
  var time = Date.now();
  var con = getExitConnection(database, time);
  if(con){
    successFn && successFn(con);
    return con;
  }
  var uri = Config.getDbUri(database);
  LogUtil.log('getConnection database', database);
  con = Mongoose.createConnection(uri, g_options);
  setExitConnection(con, database, time);
  con.on('error', function(err){
    LogUtil.error(`uri: ${uri},  time: ${new Date().toString()},  createConnection err: ${err.message}`);
  });
  con.on('connected', function(){
    successFn && successFn(con);
    LogUtil.log(`connected success, uri: ${uri},  time: ${new Date().toString()}`);
  });
  return con;
};

var createSchedule = function(callback, h){
  Schedule.scheduleJob(`0 0 ${h} * * *`, function(){
    callback();
  });
};
createSchedule(function(){
  var keys = Object.keys(modelMap),
      item = null,
      now = Date.now();
  keys.forEach(function(key){
    item = modelMap[key];
    if(now - modelMap[key].time > ONE_DAY_MS){
      delete modelMap[key];
    }
  });
}, 3);

//model获取，实现model复用
var modelMap = {};
var getModel = function(collectionName, schema, database){
  var model = modelMap[collectionName];
  model && (model = model.model);
  if(!model){
    database = database || g_dbName;
    con = getConnection(database);
    model = con.model(database ,schema, collectionName);
    modelMap[collectionName] = model;
    modelMap[collectionName] = {
      model: model,
      time: Date.now()
    };
  }
  return model;
};

var methods = {
  save(collectionName, schema, data, callback, completeFn, database){
    var model = getModel(collectionName, schema, database);
    return model.create(data, function(err){
      if(err){
        completeFn && completeFn(err);
        LogUtil.printFirstError(err.message, data);
        LogUtil.error(`${database? "database: " + database : ""}, collectionName: ${collectionName},  time: ${new Date().toString()},  save err: ${err.message}`);
        return;
      }
      callback && callback();
      completeFn && completeFn(err);
    });
  },
  travelAll(collectionName, schema, callback, completeFn, filterFn = function(q){return q;}, database){
    database = database || g_dbName;
    var model = getModel(collectionName, schema, database);
    var query = model.find({});
    filterFn(query)
    .cursor()
    .on('data', callback)
    .on('end', completeFn);
  },
  find(collectionName, schema, conditions, callback, completeFn, database){
    var model = getModel(collectionName, schema, database);
    if(!callback && !completeFn){
      return model.find(conditions);
    }
    model.find(conditions, (err, r) => {
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`${database? "database: " + database : ""}, collectionName: ${collectionName},  time: ${new Date().toString()},  update-find err: ${err.message}`);
        return;
      }
      callback && callback(r);
      completeFn && completeFn(err);
    });
  },

  pfind(collectionName, schema, conditions, database){//返回promise对象
    var model = getModel(collectionName, schema, database);
    return model.find(conditions).exec();
  },
  count(collectionName, schema, conditions, callback, completeFn, timeFilter, database){
    var model = getModel(collectionName, schema, database);
    var query = model.where(conditions);
    timeFilter && (query = timeFilter(query));
    query.count(function(err, count){
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`${database? "database: " + database : ""}, collectionName: ${collectionName},  time: ${new Date().toString()},  count err: ${err.message}`);
        return;
      }
      callback && callback(count);
      completeFn && completeFn(err);
    });
  },
  findOneAndUpdate(collectionName, schema, data, conditions, callback, completeFn, database){
    var model = getModel(collectionName, schema, database);
    return model.findOneAndUpdate(conditions, data, {upsert: true}, function(err){
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`${database? "database: " + database : ""}, collectionName: ${collectionName},  time: ${new Date().toString()},  findOneAndUpdate err: ${err.message}`);
        return;
      }
      callback && callback();
      completeFn && completeFn(err);
    });
  },
  findByIdAndRemove(collectionName, schema, id, callback, completeFn, database){
    var model = getModel(collectionName, schema, database);
    return model.findByIdAndRemove(id, function(err){
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`${database? "database: " + database : ""}, collectionName: ${collectionName},  time: ${new Date().toString()},  findByIdAndRemove err: ${err.message}`);
        return;
      }
      callback && callback();
      completeFn && completeFn(err);
    });
  },
  update(collectionName, schema, data, conditions, opt, database){
    var model = getModel(collectionName, schema, database);
    model.find(conditions, (err, r) => {
      if(err){
        LogUtil.error(`${database? "database: " + database : ""}, collectionName: ${collectionName},  time: ${new Date().toString()},  update-find err: ${err.message}`);
        return;
      }
      if(r.length){
        model.findByIdAndUpdate(r[0]._id, opt, function(err){
          if(err){
            LogUtil.error(`${database? "database: " + database : ""}, collectionName: ${collectionName},  time: ${new Date().toString()},  update-findByIdAndUpdate err: ${err.message}`);
            return;
          }
        });
      }else{
        this.save(database, schema, data);
      }
    });
  },
  dropDatabase(database, callback) {
    var con = Mongoose.createConnection(Config.getDbUri(database), {
      user: Config.user,
      pass: Config.pass
    });
    con.on('error', function(err){
      callback && callback(false);
    });
    con.on('connected', function(){
      con.dropDatabase(function(){
        callback && callback(true);
      });
    });
  },
  dropCollection(collectionName, callback, database){
    database = database || g_dbName;
    var con = getConnection(database);
    if(con){
      con.dropCollection(collectionName, function(){
        callback && callback();
      });
    }else{
      callback && callback();
    }
  },
  getDbList(database, callback){
    var Admin = Mongoose.mongo.Admin,
        uri = Config.getDbUri(database),
        connection = Mongoose.createConnection(uri, g_options);
    console.log('getDbList uri:', uri, 'time:', new Date().toString());
    connection.on('connected', function() {
        new Admin(this.db).listDatabases(function(err, result) {
            callback && callback(err, result.databases);
            if(err){
              LogUtil.error(`database: ${database},  time: ${new Date().toString()},  showDbs err: ${err.message}`);
              return;
            }
        });
    });
  },
  getCoNames(callback, database){
    database = database || g_dbName;
    getConnection(database, function(con){
      con.db.listCollections().toArray(function(err, items){
        if(err){
          callback && callback(err)
        }
        callback && callback(null, items.map(function(item){
          return item.name;
        }))
      });
    });
  },
  getCoList(callback, schemaMap, database){
    var keys = Object.keys(schemaMap),
        key,
        fns = [];
    function getSchemaKey(collectionName){
      for(var val of keys){
        if(collectionName.indexOf(val) == 0){
          return val;
        }
      }
      return null;
    }

    this.getCoNames((err, names) => {
      if(!err){
        names.forEach((name) =>{
          key = getSchemaKey(name);
          if(key){
            fns.push((cb) => {
              this.count(name, schemaMap[key], {}, function(count){
                cb(null, {
                  name: name,
                  count: count
                });
              }, function(err){
                if(err){
                  cb(err, {
                    name: name,
                    count: 'unknow'
                  });
                }
              })
            });
          }
        });
        Async.series(
        fns,
        function(err, results){
          callback(err, results);
        });
      }else{
        callback(err);
      }
    }, database)
  },
  aggregate(collectionName, schema, arr, callback, database){
    var model = getModel(collectionName, schema, database);
    return model.aggregate(arr).exec(callback);
  }
};
module.exports = methods
