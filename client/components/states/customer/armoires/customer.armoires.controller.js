'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:CustomerArmoiresController
   * @description
   * # CustomerArmoiresController
   * Controller of the app
   *
   * ## Route
   * <code>/customer/armoire</code>
   */
  angular.module('app').controller('CustomerArmoiresController',
    function (armoireTypes, $scope, $log, $timeout, SweetAlert, views, User, Auth) {
      $scope.armoireTypes = armoireTypes; // Resolved by UI-Router

      $scope.currentUser = Auth.user;

      $scope.$watch('q', function(newValue){
        $log.info('q', newValue);
        $timeout(function(){
          $scope.refresh();
        })
      });

      $scope.refresh = function(){
        Auth.user.armoire.getList().then(
          function(armoires){
            $scope.currentUser.armoires = armoires;
          },
          function(err){
            SweetAlert.error("Oops...", "Problem loading your armoires. Please try again shortly.");
          }
        );
      };
    }
  );
})();
