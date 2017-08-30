'use strict';

(function(){
  angular.module('app').directive('smallCenterWithLogo', function() {
    return {
      restrict: 'AE',
      link: function(scope, el, attrs){
        el.addClass('col-xs-10 col-xs-offset-1 col-sm-6 col-sm-offset-3 col-md-4 col-md-offset-4');
        el.prepend( '<img src="/images/Armoire-Logo.png" style="width: 100%"><p>&nbsp;</p>');
      }
    };
  });
})();
