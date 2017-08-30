(function(){
  'use strict';

  /**
   * @ngdoc function
   * @name app.controller:ProfileController
   *
   * @description
   * # ProfileController
   * Controller for a user's profile.
   *
   * ## Route
   * <code>/profile</code>
   */
  angular.module('app').controller('ProfileController',
    function ($log, $rootScope, $scope, $state, $timeout, SweetAlert, $modal, Auth, regions, views) {
      $log.info(Auth.user);

      $scope.user = Auth.user;
      $scope.processing = false;

      //-------------------------------------------------------------
      // Alerts
      //-------------------------------------------------------------
      $scope.alerts = [];
      $scope.addAlert = function(type, msg) {
        type = type || 'success';
        $scope.alerts.push({type: type, msg: msg});
      };

      $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
      };

      $scope.checkProfileComplete = function(){
        if(!$scope.user.isProfileComplete){
          $scope.addAlert(
            'warning',
            '<strong>Wait</strong><br/>You need to finish your profile before you can add any armoires!'
          );
        }else if(!$scope.user.profileCompletedAlertShown){
          // clear all alerts
          $scope.alerts = [];
          // tell API we showed alert
          $scope.user.patch({
            profileCompletedAlertShown: true,
          });
          SweetAlert.success("Success!", "Your profile is now complete.");
        }
      };

      //TODO: Need to get user after address update and billing update!!
      $rootScope.$on('billingUpdated', function(){
        refreshUserObj();
      });

      $scope.checkProfileComplete();

      //-------------------------------------------------------------
      // GENERAL
      //-------------------------------------------------------------
      $scope.generalFormSubmit = function(){
        $scope.processing = true;
        $scope.user.patch({
          firstName: $scope.user.firstName,
          lastName: $scope.user.lastName,
          phone: $scope.user.phone,
          local: $scope.user.local
          }).then(function(user){
            SweetAlert.success("Yay!", "Info updated");
            refreshUserObj();
        },
        function(err){

        });
      };


      //-------------------------------------------------------------
      // ADDRESS
      //-------------------------------------------------------------
      $scope.regions = regions;
      $scope.cities = [];
      $scope.states = [];

      $scope.addressFormSubmit = function(){
        $scope.processing = true;
        $scope.user.patch({
          address: $scope.user.address
        }).then(function(user){
            SweetAlert.success("Yay!", "Address updated");
            refreshUserObj();
        },
        function(err){

        },
        function(){
          $scope.processing = false;
        });
      };

      $scope.$watch('user.address.country', function(newValue){
        if(newValue){
          $scope.states = _.findWhere(regions, { country: newValue}).states;
          if($scope.states.length){
            $scope.user.address.state = $scope.states[0].state;
          }
        }
      });

      $scope.$watch('user.address.state', function(newValue){
        if(newValue){
          $scope.cities = _.findWhere($scope.states, { state: newValue}).cities;
        }
      });

      $timeout(function(){
        if(!angular.isDefined($scope.user.address)){
          $scope.user.address = {};
          $scope.user.address.country = $scope.regions[0].country;
        }
      });

      //-------------------------------------------------------------
      // PASSWORD
      //-------------------------------------------------------------
      $scope.passwordFormSubmit = function(){
        $scope.user.patch({
          local: {
            password: $scope.password,
            email: $scope.user.local.email
          }
        }).then(function(user){
            SweetAlert.success("Yay!", "Password updated");
        },
        function(err){
          $log.error(err);
        },
        function(){
          $scope.processing = false;
        });
      };

      function refreshUserObj(){
        console.log('refreshUserObj');
        // get an updated user obj from API
        Auth
        .getUser()
        .then(function(user){
          $timeout(function(){
            $scope.user = user;
            $scope.checkProfileComplete();
          });
        });
      }
    }
  );
})();
