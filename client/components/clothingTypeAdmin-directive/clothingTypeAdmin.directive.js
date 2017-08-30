(function() {
  'use strict';

  angular.module('app')
    .directive('clothingTypeAdmin',
      function($log, $timeout, SweetAlert, pricingRepo) {

        var _postLink = function(scope, el, attrs) {
          scope.item = scope.item || {};

          scope.create = function() {
            scope.item.sending = true;
            pricingRepo.clothingType.post(scope.item).then(
              function(succ) {
                SweetAlert.success('Yay!', 'Clothing created');
                if (scope.onCreate) {
                  scope.onCreate();
                }
              },
              function(err) {
                SweetAlert.error('Whoops!', 'Could create clothing.');
              }
            ).finally(
              function() {
                scope.item.sending = false;
              }
            );
          };

          scope.update = function() {
            if (scope.item.fromServer) {
              scope.item.patch().then(
                function(succ) {
                  SweetAlert.success('Yay!', 'Clothing updated');
                  if (scope.onUpdate) {
                    scope.onUpdate();
                  }
                },
                function(err) {
                  SweetAlert.error('Whoops!', 'Could update clothing.');
                }
              );
            } else {
              scope.create();
            }
          };

          scope.destroy = function() {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Your will not be able to undo this!",
                type: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: true
              },
              function(isConfirm) {
                if (isConfirm) {
                  scope.item.remove().then(
                    function(succ) {
                      SweetAlert.success('Yay!', 'Clothing destroyed');
                      if (scope.onDestroy) {
                        scope.onDestroy();
                      }
                    },
                    function(err) {
                      SweetAlert.error('Whoops!', 'Could destroy clothing.');
                    }
                  );
                }
              });
          };
        };

        return {
          restrict: 'AE',
          scope: {
            item: '=',
            onCreate: '&onCreate',
            onUpdate: '&onUpdate',
            onDestroy: '&onDestroy'
          },
          templateUrl: 'components/clothingTypeAdmin-directive/clothingTypeAdmin.html',
          link: _postLink
        };
      });

}());
