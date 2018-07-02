const mongoose = require('mongoose');
const async = require('async');
var reportSchema = require('./schema/reportSchema.js');
var androidReportSchema = require('./schema/androidReportSchema.js');
var jobAndroidReportSchema = require('./jobSchema/androidReportSchema.js');
var warnReportSchema = require('./schema/warnReportSchema.js');
var jsErrorSchema = require('./schema/jsErrorSchema.js');
var resourcesSchema = require('./schema/resourcesSchema.js');
var memorySchema = require('./schema/memorySchema.js');
var timingSchema = require('./schema/timingSchema.js');
var jobPVSchema = require('./jobSchema/pageSchema.js');
var jobAllPageSchema = require('./jobSchema/allPageSchema.js');
var jobResourcesSchema = require('./jobSchema/resourcesSchema.js');
var jobTimingSchema = require('./jobSchema/timingSchema.js');
var jobMemorySchema = require('./jobSchema/memorySchema.js');
var jobJsErrorSchema = require('./jobSchema/jsErrorSchema.js');

var roleSchema = require('./manageSchema/roleSchema.js');
var configSchema = require('./manageSchema/configSchema.js');
var userSchema = require('./manageSchema/userSchema.js');
var projectSchema = require('./manageSchema/projectSchema.js');
var db = require('./db.js');

var schemaMap = {};
schemaMap.warnReport = warnReportSchema;
schemaMap.timing = timingSchema;
schemaMap.memory = memorySchema;
schemaMap.jsError = jsErrorSchema;
schemaMap.resources = resourcesSchema;
schemaMap['job-pv'] = jobPVSchema;
schemaMap['job-all-page'] = jobAllPageSchema;
schemaMap['job-resources'] = jobResourcesSchema;
schemaMap['slow-resources'] = jobResourcesSchema;
schemaMap['job-timing'] = jobTimingSchema;
schemaMap['slow-timing'] = jobTimingSchema;
schemaMap['job-memory'] = jobMemorySchema;
schemaMap['big-memory'] = jobMemorySchema;
schemaMap['job-jsError'] = jobJsErrorSchema;
schemaMap['manage-projects'] = projectSchema;
schemaMap['manage-role'] = roleSchema;
schemaMap['manage-config'] = configSchema;
schemaMap['manage-user'] = userSchema;

schemaMap['report'] = reportSchema;
schemaMap['androidReport'] = androidReportSchema;
schemaMap['job-androidReport'] = jobAndroidReportSchema;

var methods = {
  savePerDay: function(type, project, data){
    var date = new Date();
    db.save(`${type}${project ? '-' + project : ''}-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`, schemaMap[type], data);
  },
  saveSimple(collectionName, data, callback, completeFn, database){
    return db.save(collectionName, schemaMap[collectionName], data, callback, completeFn, database);
  },
  save(type, project, data, callback, completeFn, database){
    return db.save(`${type}${project ? '-' + project : ''}`, schemaMap[type], data, callback, completeFn, database);
  },
  travelAllPreDay(type, project, callback, completeFn, filterFn){
    var pre = new Date(Date.now() - 86400000);
    // db.travelAll(`${type}${project ? '-' + project : ''}-2016126`, schemaMap[type], callback, completeFn);
    db.travelAll(`${type}${project ? '-' + project : ''}-${pre.getFullYear()}${pre.getMonth() + 1}${pre.getDate()}`, schemaMap[type], callback, completeFn, filterFn);
  },
  travelAll(type, project, callback, completeFn, filterFn, database){
    db.travelAll(`${type}${project ? '-' + project : ''}`, schemaMap[type], callback, completeFn, filterFn, database);
  },
  findOneAndUpdate(type, project, data, conditions, callback, completeFn){
    return db.findOneAndUpdate(`${type}${project ? '-' + project : ''}`, schemaMap[type], data, conditions, callback, completeFn);
  },
  findByIdAndRemove(type, project, id, callback, completeFn){
    return db.findByIdAndRemove(`${type}${project ? '-' + project : ''}`, schemaMap[type], id, callback, completeFn);
  },
  find(type, project, conditions, callback, completeFn){
    return db.find(`${type}${project ? '-' + project : ''}`, schemaMap[type], conditions, callback, completeFn);
  },
  findPreDay(type, project, conditions, callback, completeFn){
    var date = new Date();
    return db.find(`${type}${project ? '-' + project : ''}-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`, schemaMap[type], conditions, callback, completeFn);
  },
  pfind(type, project, conditions){
    return db.pfind(`${type}${project ? '-' + project : ''}`, schemaMap[type], conditions);
  },
  pfindPreDay(type, project, conditions){
    var date = new Date();
    return db.pfind(`${type}${project ? '-' + project : ''}-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`, schemaMap[type], conditions);
  },
  count(type, project, conditions, callback, completeFn, timeFilter){
    return db.count(`${type}${project ? '-' + project : ''}`, schemaMap[type], conditions, callback, completeFn, timeFilter);
  },
  countPreDay(type, project, conditions, callback, completeFn, timeFilter){
    var date = new Date();
    return db.count(`${type}${project ? '-' + project : ''}-${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`, schemaMap[type], conditions, callback, completeFn, timeFilter);
  },
  update(type, project, data, conditions, opt){
    db.update(`${type}${project ? '-' + project : ''}`, schemaMap[type], data, conditions, opt);
  },
  closeConnectionPreDay(type, project){
    var pre = new Date(Date.now() - 86400000);
    db.closeConnection(`${type}${project ? '-' + project : ''}-${pre.getFullYear()}${pre.getMonth() + 1}${pre.getDate()}`);
    // db.closeConnection(`${type}${project ? '-' + project : ''}-2016126`);
  },
  closeConnection(type, project){
    // db.closeConnection(`${type}${project ? '-' + project : ''}`);
    db.closeConnection(`${type}${project ? '-' + project : ''}`);
  },
  getDbList(database, callback){
    db.getDbList(database, callback);
  },
  pageQuery (page, pageSize, populate, type, project, conditions, sortParams, callback, timeFilter) {
    page = page || 1;
    pageSize = pageSize || 10;
    var start = (page - 1) * pageSize;
    var $page = {
        cur: parseInt(page)
    };
    async.parallel({
        count: (done) => {  // 查询数量
          this.count(type, project, conditions, function (count) {
              done(null, count);
          }, function(err) {
            if(err){
              done(err, null);
            }
          }, timeFilter);
        },
        records: (done) => {   // 查询一页的记录
          var query = this.find(type, project, conditions);
          timeFilter && (query = timeFilter(query));
          query.skip(start).limit(pageSize).populate(populate).sort(sortParams).exec(function (err, doc) {
              done(err, doc);
          });
        }
    }, function (err, results) {
        var count = results.count;
        $page.total = count;
        $page.pageCount = Math.ceil(count / pageSize);
        $page.data = results.records;
        callback(err, $page);
    });
  },
  aggregate(type, project, arr, callback){
    return db.aggregate(`${type}${project ? '-' + project : ''}`, schemaMap[type], arr, callback);
  },
  dropCollection(collectionName, callback, database){
    return db.dropCollection(collectionName, callback, database);
  },
  dropDatabase(database, callback) {
    return db.dropDatabase(database, callback);
  },
  getCoNames(callback, database){
    return db.getCoNames(callback, database);
  },
  getCoList(callback, database){
    return db.getCoList(callback, schemaMap, database);
  }
}

module.exports = methods;
