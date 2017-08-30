'use strict';

(function () {
  angular.module('app')
    .controller('AdminCustomersShowController',
    function (fetchedUser, $scope, $stateParams, $log, $q, $timeout, $document, User, Auth) {
      $scope.fetchedUser = fetchedUser; // Resolved by ui-state
      $scope.currentUser = Auth.user;

      $timeout(function(){
        $(".nav").sticky({topSpacing:stickyTopOffset});
      });
    }
  );
})();
