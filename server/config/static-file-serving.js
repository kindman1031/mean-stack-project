module.exports = function (app, config) {
  var path = require('path');
  var express = require('express');

  app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

  if(config.serve_dist){
    app.use(express.static(path.resolve(__dirname, '../../dist')))
  } else {
    app.use(express.static(path.resolve(__dirname, '../../client')))
  }

  app.get('debug:log')('config/static-file-serving ran successfully');
};
