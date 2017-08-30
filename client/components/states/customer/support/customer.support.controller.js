'use strict';

(function() {
  angular.module('app')
    .controller('CustomerSupportController',
    function (support, $log, $scope, $stateParams, $q, $timeout, $document, User, Auth) {
      $scope.support = support;
      //$scope.support = Auth.user.support;
      $scope.message = '';
      $scope.sending = false;

      $timeout(function(){
        $("#reply-box").sticky({bottomSpacing:1});
      });

      $scope.gotoBottom = function(duration) {
        var dPerMessage = 300; // Milliseconds
        duration = duration || dPerMessage * $scope.support.messages.length;
        //$log.info(duration, $scope.supportConvo.messages);
        var someElement = angular.element(document.getElementById('after-messages'));
        $document.scrollToElement(someElement, 0, duration);
      };

      var refresh = function(){
        var deferred = $q.defer();

        Auth.user.support.get().then(
          function(succ){
            $scope.support = succ;
            processConvos();
            deferred.resolve(succ);
          },
          function(err){
            deferred.reject(err);
          }
        );
        return deferred.promise;
      };

      var processConvos = function(){
        _.each($scope.support.messages, function(message){
          /*
          if(message.owner){
            message.isUser = Auth.user.id === message.owner.id
          } else {
            message.isUser = false;
          }
          */
        });
        $timeout(function(){
          $scope.gotoBottom();
        });
      };

      processConvos();

      ///*
      $scope.sendMessage = function(){
        $scope.sending = true;
        Auth.user.support.post({
          message: $scope.message
        }).then(
          function(){
            $scope.message = '';
            refresh().then(function(){
              $scope.sending = false;
            });
          },
          function(err){

          }
        )
      };
    }
  );
})();
