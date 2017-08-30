(function() {
  'use strict';

  var express = require('express');
  var controller = require('./armoire.controller');
  var clothingController = require('../clothing/clothing.controller');
  var router = express.Router();
  var debug = require('debug')(APP_NAME.concat(':armoire.index'));

  router.param('armoire', controller.armoire);
  router.param('clothing', clothingController.clothing);

  router.get('/', controller.index);
  router.post('/', controller.create);

  router.get('/:armoire', controller.show);
  router.put('/:armoire', controller.update);
  router.patch('/:armoire', controller.update);
  router.delete('/:armoire', controller.destroy);
  router.post('/:armoire/addDelivery', controller.addDelivery);

  router.post('/:armoire/clothing', clothingController.create);

  module.exports = router;
}());
