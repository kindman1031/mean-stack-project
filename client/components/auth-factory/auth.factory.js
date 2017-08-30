(function() {
  'use strict';

  angular.module('app')
    .constant('defaultUser', {
      role: routingConfig.userRoles.public
    })
    .factory('Auth', function ($q, $timeout, $log, $window, $http, $rootScope, $cookieStore, Restangular, appSocket, User, defaultUser, events) {
      var endpoint = Restangular.one('auth');

      var accessLevels = routingConfig.accessLevels;
      var userRoles = routingConfig.userRoles;
      var currentUser = $cookieStore.get('user') || { role: userRoles.public };

      $cookieStore.remove('user');

      var changeUser = function(user) {
        angular.extend(currentUser, user);

        // Delete everything that is not in the default user
        if(user.role == userRoles.public){
          //console.log('Found public user, cleaning house.');
          _.forIn(currentUser, function(value, key){
            if(!defaultUser.hasOwnProperty(key)){
              //console.log('deleting ' + key);
              delete currentUser[key];
            }
          });
        } else {
          // Logged in user
        }
        $cookieStore.put('user', currentUser);
      };

      var authService = {};
      authService.accessLevels = routingConfig.accessLevels;
      authService.userRoles = routingConfig.userRoles;
      authService.checkedSession = false;
      authService.user = currentUser;

      authService.authorize = function(accessLevel, role) {
        if(role === undefined) {
          role = currentUser.role;
        }

        return accessLevel.bitMask & role.bitMask;
      };

      authService.getUser = function(userId){
        //$log.info('auth.getUser()', arguments);
        userId = userId || currentUser.id;

        var deferred = $q.defer();

        User.one(userId).get().then(function(user){
          changeUser(user);
          authService.checkedSession = true;
          $log.info(user);
          deferred.resolve(currentUser);
        }, function(err){
          changeUser(defaultUser);
          authService.checkedSession = true;
          deferred.reject(err);
        });

        return deferred.promise;
      };

      authService.getSession = function(){
        //$log.info('auth.getSession()', arguments);

        var deferred = $q.defer();

        endpoint.one('session').get().then(
          function(userObj){
            changeUser(userObj);
            deferred.notify('user is logged in, getting user details');
            authService.getUser(userObj.id).then(function(resp){
              deferred.resolve(resp);
            }, function(err){
              deferred.reject(err);
            });
          },
          function(err){
            authService.checkedSession = true;
            changeUser(defaultUser);
            deferred.reject(err);
          }
        );
        return deferred.promise;
      };

      authService.isLoggedIn = function() {
        return angular.isDefined(currentUser.id) ;
      };

      authService.login = function (user) {
        var deferred = $q.defer();

        endpoint.post('login', {
          email: user.email,
          password: user.password,
          rememberMe: true
        }).then(
          function (user) {
            changeUser(user);
            authService.getUser(user.id).then(
              function(){
                deferred.resolve(currentUser);
              },
              function(err){
                deferred.reject(err);
              }
            );
          }, function (err) {
            deferred.reject(err);
          }
        );
        return deferred.promise;
      };

      authService.logout = function (callback, errCallback) {
        var cb = callback || angular.noop;
        var errCb = errCallback || angular.noop;

        endpoint.one('logout').get().then(function (res) {
            if(cb)
              cb();
          },
          function (err) {
            if(errCb)
              errCb(err.data);
          }
        );
        changeUser(defaultUser);
      };

      authService.signup = function(user){
        return endpoint.post('signup', user).then(
          function(user){
            authService.checkedSession = true;
            changeUser(user);
            return currentUser;
          },
          function(err){
            return err;
          }
        );
      };

      authService.forgotPassword = function(email){
        return endpoint.post('forgot-password', {
          email: email
        });
      };

      authService.resetPassword = function(token, password, passwordConfirm){
        return endpoint.one('reset-password').post(token, {
          password: password,
          passwordConfirm: passwordConfirm
        });
      };

      return authService;
    }
  );

}());
