// require('longjohn');

// (function() {
//     var childProcess = require("child_process");
//     var oldSpawn = childProcess.spawn;
//     function mySpawn() {
//         console.log('spawn called');
//         console.log(arguments);
//         var result = oldSpawn.apply(this, arguments);
//         return result;
//     }
//     childProcess.spawn = mySpawn;
// })();

global.APP_NAME = 'armoire-app';

global.base_dir = __dirname;

global.abs_path = function(path) {
  return base_dir + '/' + path;
};

global.include = function(file) {
  return require(abs_path(file));
};

process.env.DEBUG = '*';
var common = require('./common');

console.log('config:', JSON.stringify(common.config, null, 2));
process.env.DEBUG = common.config.debug;

/// Continue normal application start.
var app = require('./server/app.js');

/// Trigger app initialization
app.initializeApplication()
  .done(function(){
    app.get('debug:log')('App successfully initialized. Now creating connection.');

    exports.server = app.listen(common.config.port, function() {
      debug = app.get('debug:log')('Express server listening on port ' + exports.server.address().port);
    });
    exports.io = require('socket.io').listen(exports.server);
    require('./server/lib/streamHandler')(exports.app, exports.io);
  }, function (err) {
    app.get('debug:log')('OHCRAP error:', err);
    throw err;
  });

exports.app     = app;
exports.server  = null;
exports.io      = null;
