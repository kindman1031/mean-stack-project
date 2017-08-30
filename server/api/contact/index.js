(function() {
  'use strict';

  var express = require('express');
  var controller = require('./contact.controller');
  var router = express.Router();
  var debug = require('debug')(APP_NAME.concat(':contact.index'));

  router.post('/', controller.create);

  module.exports = router;

}());
