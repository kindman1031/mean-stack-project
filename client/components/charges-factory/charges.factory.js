(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.charges
   * @requires Restangular
   * @description
   * # Charges
   * Factory in the app.
   */
  angular.module('app').factory('charges',
    function (Restangular) {
      var endpoint = Restangular.one('charges');

      // Public API here
      return {
        list: function(q){
          q = q || '';
          return endpoint.getList("", { q: q }).then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        },
        getById: function(id){
          return endpoint.one(id).get().then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          );
        }
      };
    }
  );
})();
