(function() {
  'use strict';

  var config = require('../config/environment/');
  var papercut = require('papercut');
  var debug = require('debug')(APP_NAME.concat(':AvatarUploader'));

  var AvatarUploader = papercut.Schema(function(schema){
    schema.version({
      name: 'thumbnail',
      size: '200x200',
      process: 'crop',
      custom: ['-auto-orient']
    });

    schema.version({
      name: 'origin',
      process: 'copy'
    });
  });

  module.exports = exports = AvatarUploader;

}());
