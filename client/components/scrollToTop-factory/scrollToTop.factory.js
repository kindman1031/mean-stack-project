"use strict";
(function () {
  /**
   * @ngdoc service
   * @name app.factory:scrollToTop
   */
  angular.module('app').factory("scrollToTop",
    function ($q, $rootScope) {
      return function (time, target_id, offset_by_menu) {
        var deferred = $q.defer();
        var _target_position = 0;
        ;

        if (getScrollXY().y > 15) {
          time = time || 300;
          //$("html, body").animate({ scrollTop: 0 }, 500, 'easeOutQuad');

          $("html, body").bind("scroll mousedown DOMMouseScroll mousewheel keyup", function () {
            $('html, body').stop();
            deferred.resolve();
          });

          if (angular.isDefined(target_id)) {
            var el = document.querySelector("#".concat(target_id));
            if (el) {
              _target_position = 0 - el.getBoundingClientRect().top;
              console.log('#'.concat(target_id, ' top:', _target_position), el)

              if (offset_by_menu) {
                var menu_el = document.getElementById('main-navigation');
                var menu_offset = parseInt(window.getComputedStyle(menu_el).getPropertyValue('height'));
                console.log('menu offset: ', menu_offset);
                _target_position -= menu_offset;
              }
            }
          }

          $("html, body").animate({scrollTop: _target_position}, time, function () {
            $("html, body").unbind("scroll mousedown DOMMouseScroll mousewheel keyup");
            deferred.resolve();
          });
        } else {
          deferred.resolve();
        }

        return deferred.promise;
      };
    }
  );
})();
