'use strict';
(function () {
  /**
   * @ngdoc service
   * @name app.imageRepo
   * @requires Restangular
   * @description
   * # imageRepo
   * Factory in the app.
   */
  angular.module('app').factory('imageRepo',
    function (Restangular) {
      var endpoint = Restangular.one('image');

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
          )
        },
        getById: function(id){
          return endpoint.one(id).get().then(
            function(res){
              return res;
            },
            function(err){
              return err;
            }
          )
        }
      }
    }
  );
})();
