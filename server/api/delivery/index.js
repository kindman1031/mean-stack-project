(function() {
  'use strict';

  var express     = require('express');
  var router      = express.Router();
  var controller  = require('./delivery.controller');
  var debug       = require('debug')(APP_NAME.concat(':delivery.index'));

  router.param('delivery', controller.delivery);

  router.get('/', controller.index);
  router.post('/', controller.create);
  router.get('/slots', controller.getSlots);
  router.get('/:delivery', controller.show);
  router.put('/:delivery', controller.update);
  router.patch('/:delivery', controller.update);
  router.delete('/:delivery', controller.destroy);

  module.exports = router;

}());
