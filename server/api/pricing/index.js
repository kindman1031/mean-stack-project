(function() {
  'use strict';

  var debug         = require('debug')(APP_NAME.concat(':pricing.index'));

  var express       = require('express');
  var router        = express.Router();
  var controller    = require('./pricing.controller');

  var common                = include('common');
  var ensureAuthenticated   = common.lib.ensureAuthenticated;
  var authorize             = common.lib.authorize;
  var ensureCurrentUser     = common.lib.ensureCurrentUser;
  var accessLevels          = common.accessLevels;
  var userRoles             = common.userRoles;

  router.param('armoireType',   controller.armoireType);
  router.param('clothingType',  controller.clothingType);

  router.get('/armoire', authorize(accessLevels.user), controller.getArmoireTypes);
  router.post('/armoire/', authorize(accessLevels.admin), controller.createArmoireType);
  router.get('/armoire/:armoireType', authorize(accessLevels.user), controller.showArmoireType);
  router.post('/armoire/:armoireType', authorize(accessLevels.admin), controller.updateArmoireType);
  router.patch('/armoire/:armoireType', authorize(accessLevels.admin), controller.updateArmoireType);
  router.delete('/armoire/:armoireType', authorize(accessLevels.admin), controller.destroyArmoireType);

  router.get('/clothing', authorize(accessLevels.user), controller.getClothingTypes);
  router.post('/clothing/', authorize(accessLevels.admin), controller.createClothingType);
  router.get('/clothing/:clothingType', authorize(accessLevels.user), controller.showClothingType);
  router.post('/clothing/:clothingType', authorize(accessLevels.admin), controller.updateClothingType);
  router.patch('/clothing/:clothingType', authorize(accessLevels.admin), controller.updateClothingType);
  router.delete('/clothing/:clothingType', authorize(accessLevels.admin), controller.destroyClothingType);

  module.exports = router;

}());
