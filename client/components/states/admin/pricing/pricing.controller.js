(function() {
  'use strict';

  angular.module('app')
    .controller('AdminPricingController',
      function($scope, $log, $timeout) {
        $timeout(function() {
          $(".nav").sticky({
            topSpacing: stickyTopOffset
          });
        });

        $scope.tabData = [{
          heading: 'Armoires',
          route: 'admin.pricing.armoire'
        }, {
          heading: 'Clothing Items',
          route: 'admin.pricing.clothingItem'
        }];

      });
})();
