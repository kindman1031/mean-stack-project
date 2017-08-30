(function() {
  'use strict';

  var all = {
    auth: {
      login: 'auth.login',
      logout: 'auth.logout',
    },
    supportConvo: {
      newMessage: 'supportConvo.newMessage'
    }
  };

  angular.module('app').constant('events', all);
})();
