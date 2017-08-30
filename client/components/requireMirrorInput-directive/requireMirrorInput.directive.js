'use strict';

(function(){
  angular.module('app').directive('requireMirrorInput', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var firstInput = '#' + attrs.requireMirrorInput;
        elem.add(firstInput).on('keyup', function () {
          scope.$apply(function () {
            var v = elem.val() === $(firstInput).val();
            ctrl.$setValidity('inputmatch', v);
          });
        });
      }
    }
  });
})();
