(function() {
  'use strict';

  angular.module('app')
    .controller('CustomerArmoiresCreateController',
      function(armoireType, slots, $scope, $log, $state, $stateParams, Auth, SweetAlert, Armoire) {
        $scope.armoireType = armoireType; // Resolved by UI-Router
        $scope.slots = slots; // Resolved by UI-Router
        $scope.armoire = {
          type: $stateParams.armoireType,
          owner: Auth.user.id,
          name: '',
          deliveryTime: null
        };

        $scope.saveArmoire = function() {
          Auth.user.armoire.post($scope.armoire).then(
            function(succ) {
              SweetAlert.success('Yay!', 'Armoire added');
              $scope.refresh(); // Inherited from parent.
              $state.go('^.show', {
                armoireId: succ.id
              });
            },
            function(err) {
              SweetAlert.error('Oops', 'We could not add an armoire at this time. Please try again later.');
            }
          );
        };

        $scope.$watch('armoire.deliveryTime', function(val) {
          $scope.armoire.deliveryTimeReadable = moment(val).format('MMMM Do, YYYY @ h:mm a');
        });

        function groupSlots(slots) {
          if (!slots.length) {
            return;
          }

          $scope.groups = [
            []
          ];
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
        groupSlots(slots);
      });
})();
