'use strict';
(function() {
  /**
   * @ngdoc directive
   * @name app.directive:loginInterface
   * @description
   * # loginInterface
   */
  angular.module('app').directive('login',
    function ($state, $location, $timeout, $log, Restangular, Auth, redirectToUrlAfterLogin) {
      var _postLink = function (scope, element, attrs) {
        scope.username = '';
        scope.password = '';
        scope.rememberme = true;

        scope.login = function () {
          //console.info('scope', scope);
        };
      };

      return {
        templateUrl: 'components/login/login.html',
        restrict: 'EA',
        link: _postLink
      };
    }
  );
})();
