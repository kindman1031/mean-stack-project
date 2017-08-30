(function() {
  'use strict';

  angular.module('app')
    .filter('countNonDelivered',
      function() {
        return function(itemsArr, scope) {
          return _.filter(itemsArr, function(item) {
            return item.status !== 'delivered';
          }).length;
        };
      });
})();
