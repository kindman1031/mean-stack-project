'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminController
   * @description
   * # AdminController
   * Controller of the app
   *
   * ## Route
   * <code>/admin</code>
   */
  angular.module('app').controller('AdminController',
    function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }
  );
})();
