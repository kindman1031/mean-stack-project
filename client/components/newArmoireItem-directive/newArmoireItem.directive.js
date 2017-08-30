(function() {
  'use strict';

  angular.module('app')
    .directive('newArmoireItem',
      function(pricingRepo) {

        var _postLink = function(scope, el, attrs) {

        };

        return {
          templateUrl: 'components/newArmoireItem-directive/newArmoireItem.directive.html',
          restrict: 'AE',
          scope: {
            newItem: '=',
            armoire: '=',
            clothingTypes: '=',
            resetItem: '&',
            onImgAdded: '&',
            saveItem: '&'
          },
          link: _postLink
        };
      });
})();
