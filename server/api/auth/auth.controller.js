(function() {
  'use strict';

  var debug = require('debug')(APP_NAME.concat(':auth.controller'));

  var express = require('express');
  var router = express.Router();
  var passport = require('passport');
  var async = require('async');
  var crypto = require('crypto');
  var app = require('../../app');
  var common = include('common');
  var config = require('../../config/environment');

  var loginUrl = '/#/auth/login';
  var redirectUrl = '/auth/redirect/';
  var loggedInUrl = '/#/account';
  var logoutRedirect = '/';

  var User = require('../user/user.model').model;
  var mailgun = require('mailgun-js')({
    apiKey: config.mailgun.api_key,
    domain: config.mailgun.domain
  });

  var bcrypt = require('bcrypt');
  var SALT_WORK_FACTOR = 10;


  module.exports.logout = function(req, res) {
    if (!req.isAuthenticated()) {
      res.send(401);
      return;
    }

    req.logout();

    if (!req.isAuthenticated()) {
      res.send(200);
    } else {
      res.send(500);
    }
  };

  module.exports.login = function(req, res, next) {
    if (req.isAuthenticated()) {
      app.connections[req.user.id];
      res.json({
        id: req.user.id
      });
      return;
    }
    res.status(404).end();
  };

  module.exports.signup = function(req, res, next) {
    if (req.isAuthenticated()) {
      res.json({
        id: req.user.id
      });
      return;
    }
    res.status(403).end();
  };

  module.exports.session = function(req, res) {
    if (req.isAuthenticated()) {
      res.json({
        id: req.user.id
      });
      return;
    }
    res.status(403).end();
  };

  module.exports.redirect = function(req, res) {
    var url = loggedInUrl;

    if (req.isAuthenticated()) {
      return res.redirect(req.user.homePath);
    }
    res.redirect(loginUrl);
  };

  module.exports.forgotPassword = function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({
          'local.email': req.body.email
        }, function(err, user) {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            done(new Error('No account with that email address exists.'));
            return;
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var mailOptions = {
          to: user.local.email,
          from: 'password-reset@' + config.mailgun.domain,
          subject: 'Armoire App - Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset-password/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        mailgun.messages().send(mailOptions, function(err) {
          //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      res.send('success');
      //res.redirect('/forgot');
    });
  };

  module.exports.resetPassword = function(req, res, next) {
    async.waterfall([
      function(done) {
        User.findOne({
          resetPasswordToken: req.params.token,
          resetPasswordExpires: {
            $gt: Date.now()
          }
        }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.status(400).end('Password reset token is invalid or has expired.');
          }

          user.local.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err, savedUser) {
            done(err, savedUser);
          });
        });
      },
      function(user, done) {
        var mailOptions = {
          to: user.local.email,
          from: 'password-reset@' + config.mailgun.domain,
          subject: 'Armoire App - Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
        };
        mailgun.messages().send(mailOptions, function(err) {
          //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          if (err) {
            done(err);
          } else if (user) {
            done(err, user);
          }
        });
      }
    ], function(err, user) {
      res.send('success');
    });
  };
}());
