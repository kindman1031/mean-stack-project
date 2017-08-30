(function() {
  'use strict';

  var express = require('express');
  var controller = require('./image.controller');
  var router = express.Router();
  var debug = require('debug')(APP_NAME.concat(':image.index'));

  router.param('image', controller.image);

  router.get('/', controller.index);
  router.post('/', controller.create);
  router.get('/:image', controller.show);
  router.put('/:image', controller.update);
  router.patch('/:image', controller.update);
  router.delete('/:image', controller.destroy);

  module.exports = router;
}());
