'use strict';

(function () {
  angular.module('app')
    .directive('slots',
    function ($log) {
      var _postLink = function postLink(scope, element, attrs) {
        scope.groups = [];

        scope.$watch('slots', function(){
          groupSlots(scope.slots);
        });

        function groupSlots(slots){
          if(!slots.length)
            return;

          scope.groups = [[]];
          var cutoff = moment(slots[0]).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
          _.each(scope.slots, function(slot){
            var mDate = moment(slot);

            if(mDate.isAfter(cutoff)){
              scope.groups.push([]);
              cutoff = moment(slot).add(1, 'days').hour(0).minute(0).subtract(1, 'minutes');
            }

            scope.groups[scope.groups.length - 1].push(mDate);
          });

          $log.info(scope.groups);
        }
      };

      return {
        templateUrl: 'components/slots-directive/slots.html',
        restrict: 'A',
        link: _postLink,
        scope: {
          slots: '=',
          selectedSlot: '='
        }
      };
    }
  );
})();
