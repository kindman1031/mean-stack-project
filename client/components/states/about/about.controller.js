'use strict';

(function(){
  /**
   * @ngdoc function
   * @name app.controller:AboutCtrl
   * @description
   * # AboutCtrl
   * Controller of the app
   *
   * ## Route
   * <code>/about</code>
   */
  angular.module('app').controller('AboutController',
    function ($scope, faq) {
      $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];

      $scope.faq = faq;
    }
  );
})();
