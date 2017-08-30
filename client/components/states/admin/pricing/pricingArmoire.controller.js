(function() {
  'use strict';

  angular.module('app')
    .controller('AdminPricingArmoireController',
      function(armoireTypes, $scope, $log, SweetAlert, pricingRepo) {
        $scope.armoireTypes = armoireTypes; // Resolved by UI router

        $scope.newType = {};

        var refreshTypes = function() {
          $scope.types = [];

          pricingRepo.armoireType.getList().then(function(types) {
            $scope.armoireTypes = types;
          }, function(err) {
            $log.error(err);
            SweetAlert.error('Whoops!', 'Error loading types.');
          });
        };

        $scope.onNewType = function() {
          $scope.newType = {};
          refreshTypes();
        };

        $scope.onDestroy = function() {
          refreshTypes();
        };
      });
})();
