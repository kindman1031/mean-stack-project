'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:ContactCtrl
   * @description
   * # ContactCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/contact</code>
   */
  angular.module('app').controller('ContactController',
    function ($scope, Auth) {
      if (Auth.isLoggedIn()) {
        $scope.emailInput = Auth.user.email;
        $scope.nameInput = Auth.user.fName + ' ' + Auth.user.lName;
      }
    }
  );
})();
