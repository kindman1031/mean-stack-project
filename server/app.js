'use strict';

var express     = require('express');
var app         = express();
var mongoose    = require('mongoose');
var passport    = require('passport');
var common      = require('../common');
var config      = common.config;
var Promise     = require('bluebird');
var connection  = require('./db');

app.set('debug:log', require('debug')('armoire-app'));
app.get('debug:log')('testing debug:log');

app.set('debug:error', require('debug')('armoire-app:error'));
app.get('debug:error')('testing debug:error');

app.initializeApplication = function () {
  return new Promise(function (resolve, reject) {

    // Populate DB with sample data
    if(config.seedDB) { require('./config/seed')(connection); }

    //var server = require('http').createServer(this);
    require('./config/express')(this, config);

    // Passport - Remember Me
    this.use( function (req, res, next) {
      if ( req.method == 'POST' && req.url == '/auth/login' ) {
        if ( req.body.rememberme ) {
          req.session.cookie.maxAge = 2592000000; // 30*24*60*60*1000 Remember 'me' for 30 days
        } else {
          req.session.cookie.expires = false;
        }
      }
      next();
    });
    require('./config/passport')(this, config, connection);
    this.use(passport.initialize());
    this.use(passport.session());

    require('./routes')(this, config);

    this.get('debug:log')('DONE Initializing Application');
    this.get('debug:log')('Resolving');

    resolve();
  }.bind(this));
};

module.exports = app;
