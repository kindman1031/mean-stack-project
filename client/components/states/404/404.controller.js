'use strict';

(function(){
  /**
   * @ngdoc function
   * @name app.controller:NotFoundController
   * @description
   * # NotFoundCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/about</code>
   */
  angular.module('app').controller('NotFoundController',
    function ($scope, $state, $timeout) {
      $scope.time = 3;
      $scope.cTime = 3;
      $scope.increment = .01;
      $scope.callbackTime = $scope.increment * 1000;

      var countdown = function(){
        $scope.cTime -= $scope.increment;
        $scope.cPer = ($scope.time - $scope.cTime)/$scope.time;
        if($scope.cTime <= 0){
          $state.go('home');
          return;
        }
        $timeout(countdown, $scope.callbackTime);
      };
      countdown();
    }
  );
})();
