(function() {
  'use strict';

  angular.module('app')
    .controller('ModalAvatarUploadController',
      function($scope, $log, $modalInstance, user) {
        $scope.ok = function(flowFile) {
          var fileReader = new FileReader();
          fileReader.onload = function(event) {
            var uri = event.target.result;
            $modalInstance.close({
              name: flowFile.name,
              uri: uri
            });
          };
          fileReader.readAsDataURL(flowFile.file);
        };
        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };
      }
    );
})();
