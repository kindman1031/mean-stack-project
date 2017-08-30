'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:CustomerBillingController
   * @description
   * # CustomerBillingController
   * Controller of the app
   *
   * ## Route
   * <code>/customer/billing-info</code>
   */
  angular.module('app').controller('CustomerBillingController',
    function ($scope) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];
    }
  );
})();
