(function() {
  'user strict';

  angular
    .module('app')
    .service('User', function(Restangular, $rootScope) {
    var User = Restangular.service('user');

    Restangular.extendModel('user', function(model) {
      model.isCurrentUser = $rootScope.user.id == model.id;

      var armoire = model.all('armoire');
      armoire.item = armoire.all('item');

      model.updateAvatar = {
        post: function(message) {
          return model.customPOST(message, 'avatar');
        }
      };

      model.armoire = armoire;

      model.billing = {
        get: function() {
          return model.customGET('billing');
        },
        post: function(message) {
          return model.customPOST(message, 'billing');
        }
      };

      model.charge = {
        post: function(message) {
          return model.customPOST(message, 'charge');
        }
      };

      model.support = {
        get: function() {
          return model.customGET('support');
        },
        post: function(message) {
          return model.customPOST(message, 'support');
        }
      };

      return model;
    });

    return User;
  });
})();
