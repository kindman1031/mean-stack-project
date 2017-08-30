'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:SignupController
   * @description
   * # SignupController
   * Controller of the app
   *
   * ## Route
   * <code>/signup</code>
   */
  angular.module('app').controller('SignupController',
    function ($scope, $timeout, $state, Auth, views) {
      $scope.user = {
      };

      $scope.views = views;

      $scope.processing = false;

      $scope.formSubmit = function () {
        $scope.processing = true;
        Auth.signup({
          firstName : $scope.user.firstName,
          lastName  : $scope.user.lastName,
          phone     : $scope.user.phone,
          email     : $scope.user.local.email,
          password  : $scope.user.local.password
        }).then(function(res){
          console.log(res);
          $state.go('profile');
        }, function(err){
          console.log(err);
        });
      };
    }
  );
})();
