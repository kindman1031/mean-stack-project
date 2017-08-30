(function() {
  'use strict';

  /**
   * @ngdoc function
   * @name app.controller:AdminCustomersController
   * @description
   * # AdminCustomersController
   * Controller of the app
   *
   * ## Route
   * <code>/admin/customers</code>
   */
  angular.module('app').controller('AdminCustomersController',
    function (users, $log, $scope, $timeout, User) {
      $scope.users = users; // From ui-router resolve

      $scope.tabData   = [
        {
          heading: 'Profile',
          route:   'admin.customer.show.profile'
        },
        {
          heading: 'Armoire',
          route:   'admin.customer.show.armoire'
        },
        {
          heading: 'Billing',
          route:   'admin.customer.show.billing'
        },
        {
          heading: 'Delivery',
          route:   'admin.customer.show.delivery'
        },
        {
          heading: 'Support',
          route:   'admin.customer.show.supportConvo'
        }
      ];

      $scope.$watch('tabData', function(newVal){
        //$log.info(newVal);
        var selected = _.findWhere(newVal, {active:true});
        if(selected){
          switch(selected.heading){
            case 'Profile':{
              break;
            }
            case 'Armoire':{
              break;
            }
            case 'Delivery':{
              break;
            }
            case 'Support':{
              break;
            }
            default: break;
          }
        }
      }, true);

      $scope.$watch('q', function(newValue){
        $timeout(function(){
          //list();
        });
      });

      function list(){
        User.getList($scope.q).then(list_callback, list_errCallback);
      }

      function list_callback(res){
        $scope.users = res;
      }

      function list_errCallback(err){

      }
    }
  );
})();
