'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:CustomerIndexCtrl
   * @description
   * # CustomerIndexCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/customer/</code>
   */
  angular.module('app').controller('CustomerIndexController',
    function (clothes, $scope) {
      $scope.clothes = clothes; // Resolved by UI-Router
    }
  );
})();
