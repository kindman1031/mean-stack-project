var mongoose    = require('mongoose');
var config      = require('./config/environment');
var debug       = require('debug')(APP_NAME.concat(':db'));
var connection  = require('mongoose').connect(config.mongo.uri);
var db          = mongoose.connection;
db.on('error', function(){
  debug('Error establishing connection to ' + config.mongo.uri);
});

db.once('open', function (callback) {
  debug('Made successful connection to MongoDB.');
});

//var connection = mongoose.createConnection();
/*
connection.open(config.mongo.uri, function (err) {
  if (err) {
    debug('\n\nERROR OPENING MongoDB connection to ' + config.mongo.uri + ':', err);
    //debug('\n\nERROR OPENING MongoDB connection');
  } else {
    debug('Made successful connection to MongoDB.');
  }
});
*/
module.exports = connection;
