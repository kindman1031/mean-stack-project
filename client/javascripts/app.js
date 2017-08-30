(function() {
  'use strict';

  angular.module('app',
    [
      'ngAnimate',
      'ngCookies',
      'ngResource',
      'ngSanitize',
      'ngTouch',
      'routingConfig',
      'hj.uiSrefFastclick',
      'btford.socket-io',
      'restangular',
      'ui.router',
      'ui.bootstrap',
      'ui.router.tabs',
      'ui.utils',
      'angular-loading-bar',
      'angular-progress-arc',
      'uiGmapgoogle-maps',
      'ngToast',
      'flow',
      'oitozero.ngSweetAlert',
      'duScroll',
      'jsonFormatter'
    ]
  ).config(function restangularConfig(RestangularProvider) {
      RestangularProvider.setBaseUrl('/api/');
      RestangularProvider.setDefaultHeaders({
        'Accept': 'application/json'
      });
    }).config( function stateProvideConfig($provide){
      return $provide.decorator('$state', function($delegate, $rootScope) {
        $rootScope.$on('$stateChangeStart', function (event, state, params) {
          $delegate.next = state;
          $delegate.toParams = params;
        });
        return $delegate;
      });
    }).config( function uiGmapConfig(uiGmapGoogleMapApiProvider){
      uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyCn71x0Uxf1_eIcrRmmgv3kR5NUNocnPKU',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
      });
    }).run(function appRun($log, $window, $rootScope, $timeout, $location, $urlRouter, $state, Restangular, uiGmapGoogleMapApi, bodyClass, scrollToTop, Auth, validationPatterns) {
      $rootScope.validationPatterns = validationPatterns;

      var updateBody = function(){
        updateBodyClasses();
      };

      var updateBodyClasses = function(){
        $rootScope.bodyClasses = bodyClass.toString();
      };

      // Intercept state change, make sure we're authorized
      $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        //$log.log('$stateChangeStart', arguments);

        event.preventDefault();
        $urlRouter.update(true); // add this!

        var authorize = function(){
          return Auth.authorize(toState.data.access);
        };

        var checkRouteAuth = function(){
          //$log.info('checkRouteAuth()');

          if(!('data' in toState) || !('access' in toState.data)){
            //$log.error("Access undefined for this state");
            //$state.go('login');
            return;
          }
          if(authorize()){
            //$log.info('Access granted, moving forward');
            $state.go(toState.name, toParams, {notify: false})
              .then(function() {
                $rootScope.$broadcast('$stateChangeSuccess', toState, toParams, fromState, fromParams);
              });
          } else if (!authorize()) {
            //$log.error("Seems like you tried accessing a route you don't have access to...");

            if(fromState.url === '^') {
              if(Auth.isLoggedIn()) {
                $state.go('');
              } else {
                $state.go('home');
              }
            } else {
              $state.go('home', {path: $location.path()});
            }
          }
        };

        if(Auth.checkedSession){
          checkRouteAuth();
        } else {
          //$log.error('Auth.checkedSession is false, checking session and running event.preventDefault()');
          Auth.getSession().then(function(resp){
            //$log.info('User logged in.');
            checkRouteAuth();
          }, function(err){
            //$log.info('User not logged in.');
            checkRouteAuth();
          }).finally(function(){
            //$log.info('Session checked.');
          });
        }
      });

      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        //$log.info('$stateChangeSuccess');
        updateBody();
      });

      // If API call shoots a 403 Forbidden or 401, hard redirect to login
      Restangular.setErrorInterceptor(
        function(response, deferred, responseHandler) {
          if (response.status === 401 || response.status === 403) {
            var url = response.config.url;
            //$log.error(url.indexOf('/api/'), url.indexOf('/api/auth/session'));
            if(url.indexOf('/api/') >= 0 && url.indexOf('/api/auth/session') == -1){
              $window.location.href='/';
              return false;
            }
          }
          return response; // stop the promise chain
        }
      );

      $rootScope.scrollToTop = scrollToTop;

      $rootScope.viewport = '';
      $rootScope.mediaquery = function () {
        if ($(".bootstrap-view-xs").css("display") == "block") {
          $rootScope.viewport = 'xs';
        }
        else if ($(".bootstrap-view-sm").css("display") == "block") {
          $rootScope.viewport = 'sm';
        }
        else if ($(".bootstrap-view-md").css("display") == "block") {
          $rootScope.viewport = 'md';
        }
        else if ($(".bootstrap-view-lg").css("display") == "block") {
          $rootScope.viewport = 'lg';
        }
        //console.log("$rootScope.viewport: ", $rootScope.viewport);
        return $rootScope.viewport;
      };
      $rootScope.mediaquery();

      $(window).on('resize', function () {
        $rootScope.$apply($rootScope.mediaquery);
      });

      $rootScope.gmapsReady = false;
      uiGmapGoogleMapApi.then(function (gmaps) {
        $rootScope.gmapsReady = true;
      });

      //watching the value of the currentUser variable.
      $rootScope.currentUser = Auth.user;

      $rootScope.$watch('currentUser', function (user) {
        updateBody();
      });

      // set default timezone
      moment.tz.setDefault("America/Chicago");
    });

}());
