(function () {
  'use strict';

  angular.module('app')
    .controller('AdminPricingClothingItemController',
    function (clothingTypes, $scope, $log, SweetAlert, pricingRepo) {
      $scope.clothingTypes = clothingTypes; // Resolved by UI router

      $scope.newType = {};

      var refreshTypes = function() {
        $scope.types = [];

        pricingRepo.clothingType.getList().then(function (types) {
          $scope.clothingTypes = types;
        }, function (err) {
          $log.error(err);
          swal('Oops', 'Error loading types.', 'error');
        });
      };

      $scope.onNewType = function(){
        $scope.newType = {};
        refreshTypes();
      };

      $scope.onDestroy = function(){
        refreshTypes();
      };
    });
})();
