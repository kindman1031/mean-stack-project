'use strict';

angular.module('app').factory('appSocket', function (socketFactory, events) {
  var appSocket = socketFactory({
    //ioSocket: '/socket.io/'
  });
  appSocket.forward('error');
  return appSocket;
});
