'use strict';
(function () {
  angular.module('app')
    .directive('sideMenu',
    function ($rootScope, Auth) {
      var _postLink = function postLink(scope, element, attrs) {
        scope.user = Auth.user;

        function onSideMenuChanged(e, args) {
        }

        $('#content-wrapper').click(onMainClick);

        function onMainClick(e) {
          closeSidebar();
        }

        function closeSidebar() {
          $('#side-menu-toggle').prop('checked', false);
        }

        $rootScope.$on('sideMenuToggle', onSideMenuChanged);
        $rootScope.$on('$stateChangeStart', closeSidebar);
      };

      return {
        templateUrl: 'components/sideMenu-directive/sideMenu.html',
        restrict: 'E',
        replace: true,
        link: _postLink
      };
    }
  );
})();
