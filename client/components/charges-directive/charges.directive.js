'use strict';

(function(){
  angular.module('app').directive("charges", function() {
    return {
      restrict: "EA",
      templateUrl: "components/charges-directive/charges.directive.html",
      scope: {
        user: "="
      },
      link: function (scope, el, attrs) {
        var self = this
          , now = new Date();

        scope.hide = true;

        scope.charges = [];

        var refresh = function() {
          scope.user.charges.get().then(
            function(succ) {
              console.log(succ);
              scope.charges = succ.data;
              scope.hide = false;
            }
          );

        };

        /**
         * Watch user changes
         */
        scope.$watch('user', function(val){
          if(val){
            refresh();
          }
        });
      }
    }
  });
})();
