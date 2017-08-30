(function() {
'use strict';
  /**
   * @ngdoc directive
   * @name app.directive:mainMenu
   * @description
   * # mainMenu
   */
  angular.module('app').directive('mainMenu',
    function ($rootScope, $window, $state, Auth) {
      var _postLink = function postLink(scope, element, attrs) {
        scope.accessLevels = Auth.accessLevels;
        scope.sideMenuOpen = false;
        scope.adminCollapse = true;
        scope.userCollapse = true;

        scope.onSearchSubmit = function (event) {
          $state.go('state({ query: ' + scope.queryTerm + '})');
        };

        // Sidebar functionality
        var _sideMenuCB = $('#side-menu-toggle');
        var _sideMenuBTN = $('#side-menu-button');

        /*
         if(!isMobile.any()){
         _sideMenuBTN.hover(function(e){
         console.log('sidebar toggle button hover')
         if(!isSideMenuOpen()){
         _sideMenuCB.prop('checked', true);
         }
         });
         }
         */

        function onSideMenuChanged(e) {
          scope.$apply(function () {
            scope.sideMenuOpen = isSideMenuOpen();
            $rootScope.$broadcast('sideMenuToggle', scope.sideMenuOpen);
          });
        }

        function isSideMenuOpen() {
          var opened = _sideMenuCB.prop('checked');
          return opened;
        }

        function collapse() {
          scope.navCollapsed = true;
        }

        function checkViewport() {
          switch (scope.viewport) {
            case 'xs':
            {
              collapse();
              scope.userCollapsed = false;
              break;
            }
            default:
            {
              scope.navCollapsed = false;
              break;
            }
          }
        }

        function onWindowResize(event) {
          checkViewport();
        }

        angular.element($window).bind("resize", function (e) {
          onWindowResize();
        });

        _sideMenuCB.change(function (e) {
          onSideMenuChanged();
        });

        $rootScope.$on('$stateChangeStart', function (e) {
          checkViewport();
        });

        checkViewport();
      };

      return {
        templateUrl: 'components/mainMenu-directive/mainMenu.html',
        restrict: 'E',
        replace: true,
        link: _postLink
      };
    }
  );
})();
