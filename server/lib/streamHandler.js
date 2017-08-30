var debug = require('debug')('streamHandler');


module.exports = function(app, io){
  app.connections = {};

  io.on('connection', function(socket){
    debug('a user connected');

    socket.on('username', function(){
      app.connections[username] = socket;
    });

    socket.on('disconnect', function(){
      debug('user disconnected');
    });
  });
};
