var Mongoose = require('mongoose');
const LogUtil = require('@flyme/skynet-utils/lib/logUtil.js');
const Config = require('./config.js');

const TIMEOUT = 3e4;
// const TIMEOUT = 864e5;

const FREQUENT_OPTIONS = {//兼容两种版本
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      keepAlive: 1,
      connectTimeoutMS: 3e4,
      autoReconnect: true,
      auto_reconnect: true
    },
    keepAlive: 1,
    connectTimeoutMS: 3e4,
    autoReconnect: true,
    auto_reconnect: true
  },
  user: Config.user,
  pass: Config.pass
};
const OCCASIONAL_OPTIONS = {//兼容两种版本
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      connectTimeoutMS: 3e4,
      autoReconnect: false,
      auto_reconnect: false,
      keepAlive: false
    },
    keepAlive: false,
    connectTimeoutMS: 3e4,
    autoReconnect: false,
    auto_reconnect: false
  },
  user: Config.user,
  pass: Config.pass
};

var g_options = null;
var g_type = '';

var connections = {};
var getExitConnection = function(database, time){
  var conInfo = connections[database];
  if(!conInfo || (time - conInfo.time > TIMEOUT && g_type == 'occasional')){
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
var getConnection = function(database, forceCreate, successFn){
  var time = Date.now();
  var con = getExitConnection(database, time);
  if(con && !forceCreate){
    return con;
  }
  var uri = Config.getDbUri(database);
  LogUtil.log('getConnection database', database);
  con = Mongoose.createConnection(uri, g_options || FREQUENT_OPTIONS);
  setExitConnection(con, database, time);
  con.on('error', function(err){
    LogUtil.error(`uri: ${uri},  time: ${new Date().toString()},  createConnection err: ${err.message}`);
  });
  con.on('connected', function(){
    successFn && successFn(database);
    LogUtil.log(`connected success, uri: ${uri},  time: ${new Date().toString()}`);
  });
  con.on('disconnected', function(){
    LogUtil.log(`disconnected success, uri: ${uri},  time: ${new Date().toString()}`);
  });
  return con;
};

//model获取，实现model复用
var modelMap = {};
var getModel = function(con, database, schema, forceCreate){
  var model = modelMap[database];
  if(!model && !forceCreate){
    model = con.model(database ,schema);
    modelMap[database] = model;
  }
  return model;
};

var methods = {
  setOptions(type){
    g_type = type;
    switch (type) {
      case 'frequent':
        g_options = FREQUENT_OPTIONS;
        break;
      case 'occasional':
        g_options = OCCASIONAL_OPTIONS;
        break;
    }
  },
  closeConnection(database){
    // connections[database] &&
    //   connections[database].close(function(err){
    //     if(err){
    //       LogUtil.error(`database: ${database},  time: ${new Date().toString()},  close err: ${err.message}`);
    //       return;
    //     }
    //     console.log('closeConnection database:', database, 'success!');
    //     delete connections[database];
    //   });
  },
  save(database, schema, data, callback, completeFn){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    return model.create(data, function(err){
      if(err){
        completeFn && completeFn(err);
        LogUtil.printFirstError(err.message, data);
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  save err: ${err.message}`);
        return;
      }
      callback && callback();
      completeFn && completeFn(err);
    });
  },
  psave(database, schema, data){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    return model.create(data);
  },
  travelAll(database, schema, callback, completeFn, filterFn = function(q){return q;}){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    var query = model.find({});
    filterFn(query).
    cursor().
    on('data', callback).
    on('end', completeFn);
  },
  find(database, schema, conditions, callback, completeFn){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    if(!callback && !completeFn){
      return model.find(conditions);
    }
    model.find(conditions, (err, r) => {
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  update-find err: ${err.message}`);
        return;
      }
      callback && callback(r);
      completeFn && completeFn(err);
    });
  },

  pfind(database, schema, conditions){//返回promise对象
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    return model.find(conditions).exec();
  },
  count(database, schema, conditions, callback, completeFn, timeFilter){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    var query = model.where(conditions);
    timeFilter && (query = timeFilter(query));
    query.count(function(err, count){
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  count err: ${err.message}`);
        return;
      }
      callback && callback(count);
      completeFn && completeFn(err);
    });
  },
  findOneAndUpdate(database, schema, data, conditions, callback, completeFn){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    return model.findOneAndUpdate(conditions, data, {upsert: true}, function(err){
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  findOneAndUpdate err: ${err.message}`);
        return;
      }
      callback && callback();
      completeFn && completeFn(err);
    });
  },
  findByIdAndRemove(database, schema, id, callback, completeFn){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    return model.findByIdAndRemove(id, function(err){
      if(err){
        completeFn && completeFn(err);
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  findByIdAndRemove err: ${err.message}`);
        return;
      }
      callback && callback();
      completeFn && completeFn(err);
    });
  },
  update(database, schema, data, conditions, opt){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    model.find(conditions, (err, r) => {
      if(err){
        LogUtil.error(`database: ${database},  time: ${new Date().toString()},  update-find err: ${err.message}`);
        return;
      }
      if(r.length){
        model.findByIdAndUpdate(r[0]._id, opt, function(err){
          if(err){
            LogUtil.error(`database: ${database},  time: ${new Date().toString()},  update-findByIdAndUpdate err: ${err.message}`);
            return;
          }
        });
      }else{
        this.save(database, schema, data);
      }
    });
  },
  getDbList(database, callback){
    var Admin = Mongoose.mongo.Admin,
        uri = Config.getDbUri(database),
        connection = Mongoose.createConnection(uri, g_options || OCCASIONAL_OPTIONS);
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
  aggregate(database, schema, arr, callback){
    var con = getConnection(database);
    var model = getModel(con, database ,schema);
    return model.aggregate(arr).exec(callback);
  }
};
module.exports = methods
