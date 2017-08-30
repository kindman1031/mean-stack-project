(function () {
  'use strict';

  /**
   * @ngdoc service
   * @name app.factory:redirectToUrlAfterLogin
   * @description
   * # redirectToUrlAfterLogin
   * Factory in the app.
   */
  angular.module('app').factory('redirectToUrlAfterLogin',
    function () {
      // Public API here
      return {
        url: '',
        isActive: function () {
          var self = this;
          return self.url !== '';
        },
        reset: function () {
          var self = this;
          self.url = '';
        }
      };
    }
  );
})();
