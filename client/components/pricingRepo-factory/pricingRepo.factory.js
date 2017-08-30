(function () {
  'use strict';

  angular.module('app').factory('pricingRepo',
    function (Restangular) {
      var endpoint    = Restangular.one('pricing');
      var armoireEP   = endpoint.all('armoire');
      var clothingEP  = endpoint.all('clothing');

      // Public API here
      return {
        armoireType: armoireEP,
        clothingType: clothingEP
      };
    }
  );
})();
