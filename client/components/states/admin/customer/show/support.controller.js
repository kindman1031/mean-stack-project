'use strict';

(function () {
  angular.module('app')
    .controller('AdminCustomersShowSupportController',
    function (support, $scope, $stateParams, $log, $q, $timeout, $document, User, Auth, appSocket) {
      $scope.support = support; // Resolved by UI-Router
      $scope.currentUser = Auth.user;
      $scope.message = '';
      $scope.sendingMessage = false;

      $scope.gotoBottom = function () {
        var duration = 1000;
        var someElement = angular.element(document.getElementById('after-messages'));
        $document.scrollToElement(someElement, 0, duration);
      };

      var processMessages = function(supportConvo){
        _.each(supportConvo.messages, function (message) {
        });
        return supportConvo;
      };

      var refreshMessages = function () {
        var deferred = $q.defer();

        $scope.fetchedUser.support.get().then(
          function (supportConvo) {
            $scope.support = processMessages(supportConvo);

            $timeout(function () {
              $scope.gotoBottom();
            });

            deferred.resolve(supportConvo);
          },
          function (err) {
            deferred.reject(err);
          }
        );
        return deferred.promise;
      };

      appSocket.on('socket:user.supportConvo.message', function(ev, data){
        $log.info(ev, data);
      });

      $scope.sendSupportMessage = function(){
        if($scope.message.length < 3){
          $log.error($scope.message, 'length too short');
          return;
        }
        $scope.sendingMessage = true;
        $scope.fetchedUser.support.post({
          message: $scope.message
        }).then(
          function(succ){
            /*
            appSocket.emit('user.supportConvo.message', {
              owner: Auth.user.id,
              recipient: $stateParams.id,
              message: message
            });
            */
            $scope.message = '';
            // refreshMessages().then(function(){
            //   $scope.sendingMessage = false;
            // });
          },
          function(err){

          }
        )
      };
    }
  );
})();
