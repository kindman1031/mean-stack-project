(function() {
  'use strict';

  angular.module('app')
    .directive("scrollTo", function($window) {
      return {
        restrict: "AC",
        compile: function() {

          var document = $window.document;

          function scrollInto(idOrName, offset) { //find element with the give id of name and scroll to the first element it finds
            if (idOrName == 'top' || idOrName == 'Top') {
              scrollInto('main');
              return;
            }
            if (!idOrName) {
              $window.scrollTo(0, 0);
              return;
            }

            //check if an element can be found with id attribute
            var el = document.getElementById(idOrName);
            if (!el) { //check if an element can be found with name attribute if there is no such id
              //el = document.getElementsByName(idOrName);

              if (el && el.length)
                el = el[0];
              else
                el = null;
            }

            if (el) { // if an element is found, scroll to the element

              var menu_offset = $('#main').cssInt('margin-top'),
                offset = offset || 0,
                time = 500;

              var top = $(el).offset().top;
              var final_top = top - offset - menu_offset;

              time = time || 500;
              //$("html, body").animate({ scrollTop: 0 }, 500, 'easeOutQuad');

              $("html, body").bind("scroll mousedown DOMMouseScroll mousewheel keyup", function() {
                $('html, body').stop();
                deferred.resolve();
              });

              $("html, body").animate({
                scrollTop: final_top
              }, time, function() {
                $("html, body").unbind("scroll mousedown DOMMouseScroll mousewheel keyup");
              });
            }
            // otherwise, ignore
          }

          return function(scope, element, attr) {
            element.bind("click", function(event) {
              scrollInto(attr.scrollTo, attr.offset);
            });
          };
        }
      };
    });
})();
