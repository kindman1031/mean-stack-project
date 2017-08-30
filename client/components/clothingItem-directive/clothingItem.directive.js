(function() {
  'use strict';

  angular.module('app')
    .directive('clothingItem', function($log, $timeout, Clothing, Delivery) {

      var _postLink = function(scope, el, attrs) {
        el.addClass('clothingItem');
        scope.item = scope.item || {};
        scope.selectTimeframe = false;

        scope.selectDeliveryTimeframe = function (){
          scope.selectTimeframe = true;
        };

        scope.cancelDeliveryTimeframe = function(){
          scope.selectTimeframe = false;
        };

      };

      return {
        restrict: 'AE',
        scope: {
          item: '=',
          hideDeliverButton: '@',
          onDeliver: '&'
        },
        templateUrl: 'components/clothingItem-directive/clothingItem.html',
        link: _postLink
      };
    });

}());
