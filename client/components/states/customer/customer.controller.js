'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:CustomerCtrl
   * @description
   * # CustomerCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/customer</code>
   */
  angular.module('app').controller('CustomerController',
    function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }
  );
})();
