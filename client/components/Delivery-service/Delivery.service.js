'user strict';

(function(){
  angular.module('app').service('Delivery', function($log, Restangular){
    var Delivery = Restangular.service('delivery');

    Restangular.extendModel('delivery', function(model){
      return model;
    });

    return Delivery;
  });
})();
