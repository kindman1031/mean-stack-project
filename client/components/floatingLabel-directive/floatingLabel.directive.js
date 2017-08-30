(function() {
  'use strict';

  angular.module('app')
    .directive('floatingLabel', function($log, $timeout) {
      return {
        restrict: 'A',
        link: function(scope, el, attrs) {

          var parent = el.parent();
          parent.addClass('floating-label');

          var label = el.parent().find('label');
          label.addClass('control-label');

          var isSelectInput = el[0].tagName.toLowerCase() == 'select';

          el.on('input focus blur change propertychange', function(e) {
            checkValue(e);
          });

          scope.$on('destroy', function() {
            el.off('input focus blur change');
          });

          // If we assign the value programatically from outside the directive, this detects it.
          attrs.$observe('ngModel', function(value) { // Got ng-model bind path here
            scope.$watch(value, function(newValue) { // Watch given path for changes
              checkValue();
            });
          });

          var checkValue = function(e) {
            $timeout(function() {
              var hasValue = 'undefined' !== attrs.ngModel;
              var hasFocus = false;
              var addFocusClass = false;

              ///*
              if (isSelectInput) {
                switch (el.val()) {
                  case null:
                  case undefined:
                  case '?':
                    {
                      hasValue = false;
                      break;
                    }
                  default:
                    {
                      hasValue = true;
                    }
                }
              } else if (!isSelectInput) {
                hasValue = (el.val().length > 0);
              }
              //*/

              if (e) {
                hasFocus = e.type === 'focus';
              }

              addFocusClass = hasFocus ? true : hasValue;
              parent.toggleClass('focused', addFocusClass);
            });

          };

          $timeout(function() {
            checkValue();
          });
        }
      };
    });

}());
