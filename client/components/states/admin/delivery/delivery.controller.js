'use strict';
(function() {
  /**
   * @ngdoc function
   * @name app.controller:AdminDeliveriesCtrl
   * @description
   * # AdminDeliveriesCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/admin/delivery</code>
   */
  angular.module('app').controller('AdminDeliveriesController',
    function (deliveries, $scope, $log, $timeout, $filter, Delivery, geolocation) {
      $scope.deliveries = deliveries; // Resolved by UI-Router

      $scope.now = moment();

      /*
      $scope.$watch('q', function(newValue){
        $timeout(function(){
          list();
        })
      });
      */

      $scope.hideCompleted = true;
      $scope.hideCancelled = true;

      $scope.$watch('deliveries', processDeliveries);

      function list(){
        Delivery.getList($scope.q).then(list_callback, list_errCallback);
      }

      $scope.refresh = function(){
        processDeliveries();
        list();
      };

      function list_callback(succ){
        $scope.deliveries = succ;
        processDeliveries();
      }

      function list_errCallback(err){

      }

      var processDeliveries = function(){
        _.each($scope.deliveries, function(delivery){
          delivery.dateMoment = moment(delivery.date);

          if(delivery.deliveredAt) {
            delivery.delivered = true;
            delivery.deliveredAtMoment = moment(delivery.deliveredAt);
          }
        });

        updateFilters();
      };

      var updateFilters = function () {
        $log.info('updateFilters');

        $scope.currentDeliveries = $filter('filter')($scope.deliveries, {
          enabled: true,
          active: true,
          delivered: false
        });

        $scope.futureDeliveries = $filter('filter')($scope.deliveries, {
          enabled: true,
          delivered: false,
          active: false
        });
        $scope.finishedDeliveries = $filter('filter')($scope.deliveries, {
          enabled: true,
          delivered: true
        });
        $scope.canceledDeliveries = $filter('filter')($scope.deliveries, {enabled: false, cancelled: true});
      };

      geolocation.getLocation().then(
        function (location) {
          //console.log(location);
          _.each($scope.users, function (user) {
            console.log(user);

            user.getDistance().then(
              function (result) {
                console.log(result);
              }
            );
          });
        },
        function (error) {
          console.error(error);
        }
      );

      processDeliveries();
    }
  );
})();
