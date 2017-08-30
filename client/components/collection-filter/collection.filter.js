'user strict';

(function(){
  angular.module('app').filter('collection', function() {
    return function(collection) {

      return collection;
    };
  });
})();
