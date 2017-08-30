'use strict';

(function() {
  /**
   * @ngdoc function
   * @name app.controller:ModalNewArmoireController
   * @description
   * # ModalNewArmoireController
   * Controller of the modal that handles adding a new Armoire.
   *
   */
  angular.module('app').controller('ModalNewArmoireController',
    function ($scope, $log, $modalInstance, user) {
      $log.info('ModalNewArmoireController');

      $scope.armoire = {};

      $scope.date = {
        opened: false,
        options: {
          formatYear: 'yy',
          startingDay: 1
        },
        formats: ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate']
      };

      //$scope.date.format = $scope.date.formats[0];
      $scope.date.format = "MMMM dd, yyyy";

      $scope.date.clear = function(){
        $scope.armoire.date = null;
      };

      $scope.date.disabled = function(date, mode) {
        return ( mode === 'day' && ( $scope.armoire.date.getDay() === 0 || $scope.armoire.date.getDay() === 6 ) );
      };

      $scope.date.today = function() {
        $scope.armoire.date = new Date();
      };

      $scope.date.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.date.opened = true;
      };

      //$scope.date.today();

      $scope.ok = function (img) {
        $modalInstance.close($scope.armoire);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }

  );
})();
