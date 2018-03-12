module.exports = {
  user: 'meizu-skynet',//用户名
  pass: 'abc12344',//密码
  authsource: 'admin',
  mongodbPrefix: 'mongodb://192.52.24.122:27017/',//数据库地址
  getDbUri(database, prefix){
    prefix = prefix || process.argv[2] || this.mongodbPrefix;
    return `${prefix}${database}?authSource=${this.authsource}`;
  }
};
