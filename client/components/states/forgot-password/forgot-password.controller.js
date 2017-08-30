'use strict';

(function() {
  /**
   * @ngdoc function
   * @name app.controller:ForgotPasswordController
   * @description
   * # ForgotPasswordController
   * Controller of the app
   *
   * ## Route
   * <code>/forgot-password</code>
   */
  angular.module('app').controller('ForgotPasswordController',
    function ($scope, $log, SweetAlert, Auth) {
      $scope.sentEmail = false;

      $scope.submit = function(){
        Auth.forgotPassword($scope.email).then(
          function(resp){
            $scope.sentEmail = true;
            SweetAlert.success('Yay', 'Check your email!');
            $log.info(resp);
          },
          function(err){
            $log.error(err);
            SweetAlert.error('Oops', 'We did not find a user with that email.');
          }
        );
      }
    }
  );
})();
