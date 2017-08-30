(function() {
  'use strict';

  var express = require('express');
  var router = express.Router();
  var debug = require('debug')(APP_NAME.concat(':user.index'));
  var passport = require('passport');

  var common = include('common');
  var ensureAuthenticated = common.lib.ensureAuthenticated;
  var authorize = common.lib.authorize;
  var ensureCurrentUser = common.lib.ensureCurrentUser;
  var accessLevels = common.accessLevels;
  var userRoles = common.userRoles;

  var controller = require('./user.controller');
  var armoireController = require('../armoire/armoire.controller');
  var deliveryController = require('../delivery/delivery.controller');
  var supportConvoController = require('../supportConvo/supportConvo.controller');

  router.param('fetchedUser', controller.fetchedUser);
  router.param('armoire', armoireController.armoire);
  router.param('delivery', deliveryController.delivery);

  // authorize(accessLevels.admin, ensureCurrentUser)

  //router.get('/', authorize(accessLevels.admin), controller.index);
  router.get('/', authorize(accessLevels.admin), controller.index);
  router.get('/:fetchedUser', authorize(accessLevels.admin, ensureCurrentUser), controller.show);
  router.put('/:fetchedUser', authorize(accessLevels.admin, ensureCurrentUser), controller.update);
  router.patch('/:fetchedUser', authorize(accessLevels.admin, ensureCurrentUser), controller.update);
  router.delete('/:fetchedUser', authorize(accessLevels.admin, ensureCurrentUser), controller.destroy);

  // handle avatar
  router.post('/:fetchedUser/avatar', authorize(accessLevels.admin, ensureCurrentUser), controller.updateAvatar);

  // Shortcut to user's armoire(s)
  router.get('/:fetchedUser/armoire', authorize(accessLevels.admin, ensureCurrentUser), armoireController.byUser);
  router.post('/:fetchedUser/armoire', authorize(accessLevels.admin, ensureCurrentUser), armoireController.create);
  router.get('/:fetchedUser/armoire/:armoire', authorize(accessLevels.admin, ensureCurrentUser), armoireController.show);
  router.patch('/:fetchedUser/armoire/:armoire', authorize(accessLevels.admin, ensureCurrentUser), armoireController.update);
  router.post('/:fetchedUser/armoire/:armoire', authorize(accessLevels.admin, ensureCurrentUser), armoireController.update);

  // Shortcut to user's billing and charge.
  router.get('/:fetchedUser/billing', authorize(accessLevels.admin, ensureCurrentUser), controller.requireStripe, controller.getBilling);
  router.post('/:fetchedUser/billing', authorize(accessLevels.admin, ensureCurrentUser), controller.requireStripe, controller.updateBilling);
  router.post('/:fetchedUser/charge', authorize(accessLevels.admin), controller.requireStripe, controller.createCharge);

  // Shortcut to user's supportConvos.
  router.get('/:fetchedUser/support/', authorize(accessLevels.admin, ensureCurrentUser), supportConvoController.byUser);
  router.post('/:fetchedUser/support', authorize(accessLevels.admin, ensureCurrentUser), controller.postMessage);

  // Shortcut to user's deliveries.
  router.get('/:fetchedUser/delivery/', authorize(accessLevels.admin, ensureCurrentUser), deliveryController.byUser);
  router.get('/:fetchedUser/delivery/:delivery', authorize(accessLevels.admin, ensureCurrentUser), deliveryController.show);

  module.exports = router;
}());
