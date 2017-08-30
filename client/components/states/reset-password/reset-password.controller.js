'use strict';

(function() {
  /**
   * @ngdoc function
   * @name app.controller:ResetPasswordController
   * @description
   * # ResetPasswordController
   * Controller of the app
   *
   * ## Route
   * <code>/reset-password</code>
   */
  angular.module('app').controller('ResetPasswordController',
    function ($scope, $log, $state, $stateParams, SweetAlert, Auth) {
      $scope.submit = function(){
        Auth.resetPassword($stateParams.token, $scope.password, $scope.passwordConfirm).then(
          function(resp){
            $log.info(resp);
            $state.go('home');
          },
          function(err){
            $log.error(err);
            SweetAlert.error('Oops', 'Expired link.');
          }
        );
      }
    }
  );
})();
