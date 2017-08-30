'use strict';
(function () {
  angular.module('app')
    .factory('geolocation',
    function ($q) {
      var location = {};

      var deferredCache = {
        getLocation: undefined
      };

      var deferred = $q.defer();

      var getLocation = function () {
        if (deferredCache.getLocation) {
          return deferred.getLocation;
        }

        deferredCache.getLocation = $q.defer();

        var returnPosition = function (position) {
          console.log(position);
          location = position;
          deferredCache.getLocation.resolve(position);
          delete deferredCache.getLocation;
        };

        var returnError = function (error) {
          if (error) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                deferredCache.getLocation.reject("User denied the request for Geolocation.");
                break;
              case error.POSITION_UNAVAILABLE:
                deferredCache.getLocation.reject("Location information is unavailable.");
                break;
              case error.TIMEOUT:
                deferredCache.getLocation.reject("The request to get user location timed out.");
                break;
              case error.UNKNOWN_ERROR:
                deferredCache.getLocation.reject("An unknown error occurred.");
                break;
            }
          } else {
            deferredCache.getLocation.reject("Geolocation is not supported.");
          }
          delete deferredCache.getLocation;
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(returnPosition, returnError);
        } else {
          returnError();
        }

        return deferredCache.getLocation.promise;
      };

      // Public API here
      return {
        location: location,
        getLocation: getLocation
      }
    }
  );
})();
