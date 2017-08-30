(function() {
  'use strict';

  angular.module('app')
    .controller('AdminCustomersBillingController', AdminCustomersBillingController);

  function AdminCustomersBillingController(fetchedUser, $scope, $timeout, $log, SweetAlert) {
    $scope.showCharges = false;
    $scope.charges = [];

    $scope.addCharge = function(chargeObj, isValid){
      if(!isValid){
        return;
      }

      $scope.fetchedUser.charge.post(chargeObj).then(
        function(succ){
          $log.info(succ.latestCharge);
          resetChargeObj();
          // insert charge
          $scope.charges.unshift(succ.latestCharge);

          SweetAlert.success('Yay!', 'Charge was applied.');
        },
        function(err){
          $log.error(err);
          SweetAlert.error('Whoops!', 'Could not charge customer.');
        }
      );
    };

    function getCharges(){
      $scope.showCharges = false;
      $scope.charges = [];

      $scope.fetchedUser.billing
        .get()
        .then(function(billedUser) {
          $timeout(function() {
            // get charges
            $scope.charges = billedUser.billingData.charges.data;
            // ready to show charges
            $scope.showCharges = true;
          });
        });
    }

    function resetChargeObj(){
      $timeout(function () {
        $scope.newCharge = {
          amount: '',
          description: ''
        };
      });
    }

    function init(){
      resetChargeObj();
      if ($scope.fetchedUser.isProfileComplete) {
        getCharges();
      }
    }

    init();
  }

})();
