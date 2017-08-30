(function() {
  'use strict';

  var config = require('../config/environment/');
  var papercut = require('papercut');
  var debug = require('debug')(APP_NAME.concat(':ImageUploader'));

  var ImageUploader = papercut.Schema(function(schema){
    schema.version({
      name: 'thumbnail',
      size: '150x150',
      process: 'crop',
      custom: ['-auto-orient']
    });

    schema.version({
      name: 'large',
      size: '600x480',
      process: 'resize'
    });

    schema.version({
      name: 'origin',
      process: 'copy'
    });
  });

  module.exports = exports = ImageUploader;

}());
