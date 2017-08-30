'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:LogoutCtrl
   * @description
   * # LogoutCtrl
   * Controller of the app.
   *
   * ## Route
   * <code>/logout</code>
   */
  angular.module('app').controller('LogoutController',
    function ($scope, $state, SweetAlert, Auth) {
      function logoutCb(){
        SweetAlert.success("Success!", "You've logged out!");
        $state.go('home');
      }

      Auth.logout(logoutCb);
    }
  );
})();
