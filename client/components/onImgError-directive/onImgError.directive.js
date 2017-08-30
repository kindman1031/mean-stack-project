(function() {
  'use strict';

  angular.module('app')
    .directive('onImgError',
    function () {

    var _link = function (scope, element, attr) {
      element.on('error', function() {
        element.attr('src', attr.onImgError);
      });
    };

    return {
      restrict: 'A',
      link: _link
    };
  });

}());
