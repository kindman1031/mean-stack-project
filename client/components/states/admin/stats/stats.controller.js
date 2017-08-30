'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminStatsCtrl
   * @description
   * # AdminStatsCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/admin/stats</code>
   */
  angular.module('app').controller('AdminStatsController',
    function ($scope) {
      var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      var charts = {
        newDeliveries: {
          id: '#delivery-new-chart',
          data: {
            labels: days,
            series: [
              [1, 0, 2, 1, 0, 0, 4]
            ]
          },
          ops: {
            low: 0,
            showArea: true,
            showLine: false,
            showPoint: false
          }
        },
        newUsers: {
          id: '#users-new-chart',
          data: {
            labels: days,
            series: [
              [1, 5, 2, 10, 8, 7, 12],
              [20, 5, 2, 10, 18, 7, 22]
            ]
          },
          ops: {
            low: 0,
            showArea: true,
            showLine: false,
            showPoint: false
          }
        },
        referrals: {
          id: '#users-referral-chart',
          data: {
            labels: days,
            series: [
              [20, 5, 2, 10, 18, 7, 22]
            ]
          },
          ops: {
            low: 0,
            showArea: true,
            showLine: false,
            showPoint: false
          }
        },
        cashFlow: {
          id: '#cash-chart',
          data: {
            labels: days,
            series: [
              [-20, 50, 515, 85, -300, 5, 64]
            ]
          },
          ops: {
            low: -400,
            showArea: true,
            showLine: false,
            showPoint: false
          }
        }
      };

      _.each(charts, function (chartSet) {
        new Chartist.Line(chartSet.id, chartSet.data, chartSet.ops);
      });
    }
  );
})();
