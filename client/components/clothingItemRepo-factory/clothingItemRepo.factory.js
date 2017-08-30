(function () {
  'use strict';
  /**
   * @ngdoc service
   * @name app.clothingItemRepo
   * @requires Restangular
   * @description
   * # clothingItemRepo
   * Factory in the app.
   */
  angular.module('app').factory('clothingItemRepo',
    function (Restangular) {
      var endpoint = Restangular.one('clothingItem');

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
