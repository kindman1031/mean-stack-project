(function() {
  'use strict';

  var express = require('express');
  var controller = require('./clothing.controller');
  var userController = require('../user/user.controller');
  var router = express.Router();
  var debug = require('debug')(APP_NAME.concat(':clothing.index'));

  router.param('clothing', controller.clothing);
  router.param('user', userController.fetchedUser);

  router.get('/', controller.index);
  router.post('/', controller.create);
  router.get('/:clothing', controller.show);
  router.get('/byUser/:user', controller.byUser);
  //router.put('/:clothing', controller.update);
  //router.patch('/:clothing', controller.update);
  //router.delete('/:clothing', controller.destroy);

  module.exports = router;

}());
