'use strict';
(function () {
  /**
   * @ngdoc service
   * @name app.regions
   * @description
   * # regions
   * Constant in the app.
   */
  angular.module('app')
    .constant('regions', [
      {
        country: 'United States',
        states: [
          {
            state: 'Illinois',
            cities: [
              'Chicago'
            ]
          }
        ]
      }
    ]);
})();
