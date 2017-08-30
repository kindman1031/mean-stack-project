(function() {
  'use strict';

  angular.module('app')
    .controller('CustomerArmoiresShowController',
      function(armoire, clothingTypes, slots, $scope, $log, $modal, Armoire, SweetAlert) {
        $scope.armoire = armoire; // Resolved by UI-Router
        $scope.clothingTypes = clothingTypes; // Resolved by UI-Router
        $scope.slots = slots; // Resolved by UI-Router

        $scope.openDeliverItemsModal = function(itemId) {
          itemId = itemId || 0;

          var modalInstance = $modal.open({
            templateUrl: 'components/deliverItems-modal/deliverItems.html',
            controller: 'ModalDeliverItemsController',
            size: 'lg',
            animation: false,
            resolve: {
              items: function() {
                return $scope.armoire.items;
              },
              slots: function() {
                return $scope.slots;
              },
              selectedItemId: function() {
                return itemId;
              }
            }
          });

          modalInstance.result.then(function(retObj) {
            $log.warn('retObj: ', retObj);
            Armoire
              .one($scope.armoire.id)
              .post('addDelivery', retObj).then(
              function(updatedArmoire) {
                $log.info('succ: ', updatedArmoire);
                $scope.armoire = updatedArmoire;
                SweetAlert.success('Yay!', 'Delivery created');
              },
              function(err) {
                $log.info('err: ', err);
                SweetAlert.error('Oops', 'We could not create this delivery at this time. Please try again later.');
              }
            );
          }, function() {
            $log.info('Modal dismissed at: ' + new Date());
          });

          $log.info(modalInstance);
        };

      });
})();
