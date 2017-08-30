(function () {
  'use strict';

  var viewsBase = '/';
  var componentsBase = viewsBase.concat('components/');
  var statesBase = componentsBase.concat('states/');

  var all = {
    includes: {
      toc: componentsBase.concat('termsAndConditions/termsAndConditions.html')
    },
    modals: {
      avatarUpload: componentsBase.concat('avatarUpload-modal/avatarUpload.html'),
      newArmoire: componentsBase.concat('newArmoire-modal/newArmoire.html'),
      deliverItems: componentsBase.concat('deliveryItems-modal/deliveryItems.html')
    }
  };

  angular.module('app').constant('views', all);
})();
