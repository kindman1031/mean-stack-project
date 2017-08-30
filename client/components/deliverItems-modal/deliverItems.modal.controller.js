(function() {
  'use strict';

  angular.module('app').controller('ModalDeliverItemsController',
    function($scope, $log, $modalInstance, items, slots, selectedItemId) {
      $log.info('ModalDeliverItemsController');

      $scope.items = items; // resolved by calling controller
      $scope.slots = slots; // resolved by calling controller
      $scope.groups = [
        []
      ];
      $scope.selectedItems = [];
      $scope.itemsSelected = false;
      $scope.deliveryDay = null;
      $scope.deliveryTime = null;

      $scope.toggleItem = function(item) {
        item.selected = !item.selected;
        $scope.itemsSelected = anySelectedItems();
      };

      $scope.ok = function() {
        // get all selected items
        $scope.selectedItems = _.filter($scope.items, function(item){ return item.selected === true; });
        $modalInstance.close({
          items: $scope.selectedItems,
          deliveryTime: $scope.deliveryTime
        });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };

      resetAllItems();
      // prepare grouped slots
      groupSlots($scope.slots);
      // select passed in item
      getSelectedItem(selectedItemId);

      function resetAllItems(){
        _.each($scope.items, function(item){ item.selected = false; });
      }

      function getSelectedItem(selectedItemId) {
        var itemToSelect = _.find($scope.items, function(item){ return item.id === selectedItemId; });
        if(itemToSelect && !itemToSelect.selected){
          $scope.toggleItem(itemToSelect);
        }
      }

      function groupSlots(slots) {
        if (!slots.length) {
          return;
        }
        var cutoff = moment(slots[0]).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
        _.each(slots, function(slot) {
          var mDate = moment(slot);
          if (mDate.isAfter(cutoff)) {
            $scope.groups.push([]);
            cutoff = moment(slot).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
          }
          $scope.groups[$scope.groups.length - 1].push(mDate);
        });
      }

      function anySelectedItems(){
        var selItems = _.find($scope.items, function(item){ return item.selected; });
        return selItems ? true: false;
      }
    }
  );
})();
