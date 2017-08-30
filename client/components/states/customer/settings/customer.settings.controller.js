'use strict';
(function () {
  /**
   * @ngdoc function
   * @name app.controller:CustomersettingsCtrl
   * @description
   * # CustomersettingsCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/customer/settings</code>
   */
  angular.module('app').controller('CustomerSettingsController',
    function ($scope, regions, User) {
      $scope.regions = regions;

      $scope.expirations = {
        months: [
          '1 - January',
          '2 - February',
          '3 - March',
          '4 - April',
          '5 - May',
          '6 - June',
          '7 - July',
          '8 - August',
          '9 - September',
          '10 - October',
          '11 - November',
          '12 - December'
        ],
        years: [
          2014,
          2015,
          2016,
          2017,
          2018,
          2019,
          2020,
          2021,
          2022,
          2023,
          2024
        ]
      };
    }
  );
})();
