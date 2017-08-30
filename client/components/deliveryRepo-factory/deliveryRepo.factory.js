(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.deliveryRepo
   * @requires Restangular
   * @description
   * # deliveryRepo
   * Factory in the app.
   */
  angular.module('app').factory('deliveryRepo',
    function (Restangular) {
      var endpoint = Restangular.one('delivery');

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
              res.moment = moment(res.date);
              return res;
            },
            function(err){
              return err;
            }
          );
        },
        slots: function(){
          return endpoint.one('slots').get().then(
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
