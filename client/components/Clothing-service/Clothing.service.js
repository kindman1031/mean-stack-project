'user strict';

(function(){
  angular.module('app').service('Clothing', function($log, Restangular){
    var Clothing = Restangular.service('clothing');

    Restangular.extendModel('clothing', function(model){
      return model;
    });

    return Clothing;
  });
})();
