'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:MainController',
   * @description
   * # MainCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/</code>
   */
  angular.module('app').controller('MainController',
    function ($scope, $log, $window, SweetAlert, Auth) {
      $scope.accessLevels = Auth.accessLevels;

      $scope.$on('socket:error', function (ev, data) {
        $log.error(ev, data);
      });

      $scope.loginLocal = function(){
        Auth.login({
          email: $scope.email,
          password: $scope.password
        }).then(function(user){
          if(angular.isDefined(user.homePath)){
            //$location.path(user.homePath);
            $window.location.href = user.homePath;
          }
        }, function(err){
          SweetAlert.error("Oops...", "Invalid email & password");
        });
      };
    }
  );
})();
