/**
 * Express configuration
 */

'use strict';

var express = require('express');
var passport = require('passport');
var favicon = require('serve-favicon');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var flash = require('express-flash');

module.exports = function(app, config) {
  app.set('env', config.env);

  //require('./compression')(app, config);
  //require('./cors.js')(app, config);
  require('./view')(app, config);
  require('./body-parsing')(app, config);
  require('./cookie-parsing')(app, config);

  if(config.serve_dist){
    app.use(favicon(__dirname + '../../../dist/favicon/favicon.ico'));
  } else {
    app.use(favicon(__dirname + '/../../client/favicon/favicon.ico'));
  }

  if('production' === config.env){

  }

  // Image/File uploads
  require('./papercut')(app, config);

  if ('development' === config.env || 'test' === config.env) {
    //require('./development/browser-sync.js')(app, config);
    require('./development/live-reload')(app, config);
  }

  require('./static-file-serving')(app, config);
  require('./sessions')(app, config);
  app.use(flash());

  //require('./logging')(app, config);
  require('./raygun')(app, config);

  app.get('debug:log')('config/express ran successfully');
};
