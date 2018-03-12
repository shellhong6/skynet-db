const Service = require('../lib/service.js');

Service.setOptions('occasional')

// Service.save('resources', 'appstore-welfare-201732', {
//     "_imei" : "",
//     "_page" : "https://i3.mzres.com/resources/appStore/welfare/views/welfare-list477.html",
//     "_reportServerTime" : 1488297600833.0,
//     "_uuid" : "7f9e6e6d-5dd5-4ec6-a5d0-025d745461db",
//     "list" : "{a:1,b:2}"
// }, function(){
//   console.log('success', arguments)
// });
var index = 1;
function test(){
  console.log(index++);
  Service.save('slow-timing', 'appstore-welfare', { _reportServerTime: 1490713236234,
    _search: '?campaignId=47&turnTo=a&business=1&os=22&mzos=5&screen_size=1080x1920&language=zh-CN&imei=863058037148545&sn=91QEBPH5ZU8M&device_model=M6810&v=5.4.19&vc=331&net=4g&uid=133191621&firmware=Flyme%205.1.6.0A&locale=CN&mpv=appsv5&custom_icon=1&uxip_session_id=5b94769f-3211-46fa-8fbc-3adececd4105&operator=46002',
    _imei: '',
    _page: 'https://bro-res2.flyme.cn/resources/activity/foolsday-store/index.html',
    ues: 0,
    uee: 0,
    scs: 1490713388324,
    ress: 1490713389026,
    rese: 1490713389250,
    reqs: 1490713388841,
    rs: 0,
    re: 0,
    ns: 1490713387882,
    ls: 1490713410092,
    le: 1490713410093,
    fs: 1490713388045,
    dle: 1490713388184,
    dl: 1490713389033,
    di: 1490713397075,
    dcls: 1490713397075,
    dcle: 1490313397105,
    dc: 1490713410092,
    cs: 1490713388184,
    ce: 1490713388838,
    readyStart: 163,
    net: 122,
    load: 20843,
    other: 0 }, function(){
    console.log('success', arguments)
  });
}
test();

// Service.save('memory', 'appstore-welfare-201731', {
//     "limit" : 111111111,
//     "total" : 10000000,
//     "used" : 10000000,
//     "_page" : "http://127.0.0.1:9999/meizu_test_page_only",
//     "_uuid" : "c16ba9dc-a159-4784-9650-77bdee091789",
//     "_imei" : "",
//     "_reportServerTime" : 1488368260894.0
// }, function(){
//   console.log('success', arguments)
// });
