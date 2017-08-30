'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminSupportController
   * @description
   * # AdminSupportController
   * Controller of the app
   *
   * ## Route
   * <code>/admin/support</code>
   */
  angular.module('app').controller('AdminSupportController',
    function (users, $scope, $timeout, User) {
      $scope.users = users; // Resolved by UI-Router
    }
  );
})();
