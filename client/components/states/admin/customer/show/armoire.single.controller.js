(function() {
  'use strict';
  angular.module('app')
    .controller('AdminCustomersArmoireSingleController',
      function($log, fetchedUser, $scope, $stateParams, $timeout,
        armoire, clothingTypes, Armoire, Clothing, SweetAlert) {
        $scope.armoire = armoire; // Resolved by UI-Router
        $scope.clothingTypes = clothingTypes; // Resolved by UI-Router

        $scope.addNew = false;

        var defaultItem = {
          sending: false,
          name: '',
          type: '',
          img: {
            name: '',
            uri: ''
          },
          options: {

          }
        };

        $scope.armoire = _.findWhere($scope.fetchedUser.armoires, {
          id: $stateParams.armoireId
        });
        $scope.showAddNew = function() {
          $scope.addNew = true;
        };
        $scope.hideAddNew = function() {
          $scope.addNew = false;
        };

        $scope.resetItem = function($flow) {
          $timeout(function() {
            if($flow){
              $flow.cancel();
            }
            $scope.newItem = angular.copy(defaultItem);
            $scope.addNew = false;
          });
        };
        $scope.resetItem();

        $scope.onImgAdded = function(flowFile) {
          var fileReader = new FileReader();
          fileReader.onload = function(event) {
            var uri = event.target.result;
            $timeout(function() {
              $scope.newItem.img = {
                name: flowFile.name,
                uri: uri
              };
            });
          };
          fileReader.readAsDataURL(flowFile.file);
        };

        $scope.saveItem = function($flow) {
          SweetAlert.swal({
            title: 'Saving...',
            text: '<h3><i class="fa fa-cog fa-spin"></i></h3>',
            html: true,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false
          });

          $scope.newItem.armoire = armoire.id;
          $scope.newItem.sending = true;
          Clothing.post($scope.newItem).then(
            function(succ) {
              SweetAlert.success('FANTASTIC', 'Item added!');
              $scope.refresh();
            },
            function(err) {
              SweetAlert.error('OOPS', 'Could not add item! Try again in a few minutes.');
              $scope.resetItem($flow);
            }
          ).finally(function() {
            $scope.newItem.sending = false;
            SweetAlert.swal.close();
          });
          $scope.resetItem($flow);
        };

        $scope.refresh = function() {
          Armoire.one(armoire.id).get().then(
            function(resp) {
              $scope.armoire = resp;
            },
            function(err) {
              SweetAlert.error('OOPS', 'Could not load armoire.');
            }
          );
        };

      }
    );
})();
