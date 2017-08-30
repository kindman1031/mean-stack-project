'use strict';

(function () {
  angular.module('app')
    .directive('slot',
    function ($log) {
      var _postLink = function postLink(scope, element, attrs) {
        //$log.info('SLOT');
      };

      return {
        templateUrl: 'components/slot-directive/slot.html',
        restrict: 'A',
        scope: {
          slot: '=',
          slotFormat: '@'
        },
        link: _postLink
      };
    }
  );
})();
