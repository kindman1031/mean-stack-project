'user strict';

(function(){
  angular.module('app').filter('centscurrency', function($filter) {
    return function(cents) {
      return $filter('currency')(cents / 100, '', 2);
    };
  });
})();
