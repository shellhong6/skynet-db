module.exports = {
  dbName: 'skynet-db',
  user: 'MEIZU_SKYNET',
  pass: 'TJyM9PyHHH!LpkSC',
  authsource: 'admin',
  mongodbPrefix: 'mongodb://10.3.24.122:28028/',
  getDbUri(database, prefix){
    prefix = prefix || process.argv[2] || this.mongodbPrefix;
    return `${prefix}${database}?authSource=${this.authsource}`;
  }
};
