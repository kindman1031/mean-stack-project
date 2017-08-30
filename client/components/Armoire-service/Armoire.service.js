'user strict';

(function(){
  angular.module('app').service('Armoire', function($log, Restangular){
    var Armoire = Restangular.service('armoire');

    Restangular.extendModel('armoire', function(model){
      return model;
    });

    return Armoire;
  });
})();
