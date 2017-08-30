(function() {
  'use strict';

  angular.module('app').factory('armoireRepo',
    function(Restangular) {
      var endpoint = Restangular.one('armoire');

      // Public API here
      return {
        list: function(q) {
          q = q || '';
          return endpoint.getList("", {
            q: q
          }).then(
            function(res) {
              return res;
            },
            function(err) {
              return err;
            }
          );
        },
        get: function(id) {
          return endpoint.one(id).get().then(
            function(res) {
              return res;
            },
            function(err) {
              return err;
            }
          );
        }
      };
    }
  );
})();
