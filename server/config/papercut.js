(function() {
  'use strict';

  module.exports = function (app, config, connection) {
    config = config || require('./environment/');
    var path = require('path');
    var papercut = require('papercut');
    var debug = require('debug')('papercut');

    papercut.configure(function(){
      papercut.set('storage', 'file');
      papercut.set('directory', abs_path('uploads/images'));
      papercut.set('url', ('/uploads/images'));
    });

    papercut.configure('staging', function(){
      papercut.set('storage', 's3');
      papercut.set('S3_KEY', config.s3.key);
      papercut.set('S3_SECRET', config.s3.secret);
      papercut.set('bucket', config.s3.bucket);
    });

    papercut.configure('production', function(){
      papercut.set('storage', 's3');
      papercut.set('S3_KEY', config.s3.key);
      papercut.set('S3_SECRET', config.s3.secret);
      papercut.set('bucket', config.s3.bucket);
    });
  };

}());
