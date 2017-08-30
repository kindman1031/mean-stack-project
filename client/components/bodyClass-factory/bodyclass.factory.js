'use strict';
(function () {
  angular.module('app')
    .factory('bodyClass',
    function ($log, $state, $stateParams, Auth) {
      var list = [];

      var toString = function(){
        generate();
        var str = list.join(' ').replace(/[.]/g, '-');
        return str;
      };

      var addClass = function (clss) {
        list.push(clss);
      };

      var genAuthClasses = function(){
        if(Auth.isLoggedIn() && Auth.checkedSession){
          addClass('logged-in');
          addClass('role-'.concat(Auth.user.role.title));
        } else {
          addClass('logged-out');
        }
      };

      var genStateClasses = function (state) {
        if (angular.isDefined(state.parent)) {
          genStateClasses(state.parent);
        }

        if (angular.isDefined(state.data)) {
          if (angular.isDefined(state.data.bodyClass)) {
            addClass(state.data.bodyClass);
          } else {
            addClass(state.self.name);
          }
          // Add dynamic slug to body class
          if (angular.isDefined($stateParams.slug)) {
            addClass($stateParams.slug);
          }
        }
      };

      var generate = function () {
        list = [];
        //$log.info($state.$current);
        genStateClasses($state.$current);
        genAuthClasses();
      };

      // Public API here
      return {
        generate: generate,

        list: function () {
          return list;
        },

        toString: toString
      };
    }
  );
})();
