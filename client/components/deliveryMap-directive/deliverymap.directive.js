'use strict';
(function () {
  angular.module('app')
    .directive('deliveryMap', function ($window, uiGmapGoogleMapApi, views) {
      var _postLink = function postLink(scope, element, attrs) {
        scope.uid = _.uniqueId('gmap-');
        scope.marker = null;

        uiGmapGoogleMapApi.then(function (gmaps) {
          getMarker(gmaps);
        });

        var getMarker = function (gmaps) {
          var gc = new gmaps.Geocoder();
          gc.geocode({address: attrs.address}, function (result, status) {

            console.log('found ' + attrs.address, result, status);

            switch (status) {
              case 'OK':
              {
                getMarkerSuccess(result);
                break;
              }
              default:
              {
                getMarkerError(result, status);
                break;
              }
            }
          });
        };

        var getMarkerSuccess = function (result) {
          var gcResult = result[0];

          // See https://code.google.com/p/gmaps-api-issues/issues/detail?id=6285
          scope.map.markers[0] = {
            id: _.uniqueId(),
            coords: {
              latitude: gcResult.geometry.location.k,
              longitude: gcResult.geometry.location.B
            },
            options: {
              draggable: false,
              //labelContent: gcResult.formatted_address,
              labelAnchor: "100 0",
              labelClass: "marker-labels"
            }
          };

          scope.map.center = {
            latitude: gcResult.geometry.location.k,
            longitude: gcResult.geometry.location.B
          };

          $($window).trigger('resize');
        };

        var getMarkerError = function (result, status) {

        };

        scope.map = {
          center: {
            latitude: 41.8369,
            longitude: 87.6847
          },
          zoom: 14,
          draggable: scope.delivery.active,
          markers: [],
          options: {
            scrollwheel: false
          }
        };

        scope.$watch('delivery.current', function () {
          scope.map.draggable = scope.delivery.active;
        });
      };
      return {
        templateUrl: 'components/deliveryMap-directive/deliveryMap.html',
        restrict: 'E',
        scope: {
          delivery: '='
        },
        link: _postLink
      };
    }
  );
})();
