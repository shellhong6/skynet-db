const Service = require('../lib/service.js');

// Service.getDbList('manage-user', function(list){
//   console.log(list);
// });

// Service.aggregate('job-jsError', 'appstore-welfare',
//   [
//     {'$match': {'solve': false}},
//     {'$limit': 20},
//     {'$project': {'id': '$_id', '_id': 0, '_page': 1, 'stack': 1, 'amount': 1}}
//   ], function(){
//   console.log(arguments[1]);
// });
Service.aggregate('job-pv', 'appstore-welfare',
  [
    {'$match': {'_reportServerTime': {'$gt': 1483434021608, '$lt': 2483434021610}}},
    {'$group': {'_id': {'page': '$_page', 'search':'$_search'}, 'count': {'$sum': 1}}},
    {'$project': {'count': 1, '_page': '$_id.page', '_search': '$_id.search', '_id': 0}}
  ], function(){
  console.log(arguments[1]);
});
// Service.aggregate('timing', 'appstore-welfare-201731',
//   [
//     {'$group': {'_id': {'page': '$_page', 'search':'$_search'}, 'count': {'$sum': 1}}},
//     {'$project': {'count': 1, '_page': '$_id.page', '_search': '$_id.search', '_id': 0}}
//   ], function(){
//   console.log(arguments[1]);
// });
