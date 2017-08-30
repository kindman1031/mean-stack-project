'use strict';
(function () {
  /**
   * @ngdoc filter
   * @name app.filter:capitalize
   * @function
   * @description
   * # capitalize
   * Filter in the app.
   */
  angular.module('app')
    .filter('capitalize',
    function () {
      return function (input, scope) {
        if (input != null) {
          input = input.toLowerCase();
          input = input.replace(/_/g, ' ');
          return input.substring(0, 1).toUpperCase() + input.substring(1);
        }
      }
    });
})();
