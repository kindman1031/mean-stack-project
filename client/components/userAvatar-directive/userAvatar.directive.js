(function() {
  'use strict';

  angular.module('app')
    .directive('userAvatar',
      function($log, $modal, views) {

        var _link = function(scope, el, attrs) {

          /*
           *
           */
          scope.openAvatarModal = function() {
            var modalInstance = $modal.open({
              templateUrl: 'components/avatarUpload-modal/avatarUpload.html',
              controller: 'ModalAvatarUploadController',
              size: 'sm',
              resolve: {
                user: function() {
                  return scope.user;
                }
              }
            });

            modalInstance.result.then(function(img) {
              uploadAvatar(img);
            }, function() {
              $log.info('Modal dismissed at: ' + new Date());
            });

            $log.info(modalInstance);
          };

          function uploadAvatar(imgObj){
            scope.user.updateAvatar
              .post({img: imgObj})
              .then(function(updatedUser){
                scope.user = updatedUser;
              }, function(error){
                $log.warn('error: ', error);
              });
          }

        };

        return {
          restrict: 'E',
          scope: {
            user: '='
          },
          templateUrl: 'components/userAvatar-directive/userAvatar.html',
          link: _link
        };
      });

}());
