(function() {
  'use strict';

  var express = require('express');
  var controller = require('./auth.controller');
  var router = express.Router();
  var passport = require('passport');
  var debug = require('debug')(APP_NAME.concat(':auth.index'));

  var loginUrl = '/#/auth/login';
  var redirectUrl = '/auth/redirect/';
  var loggedInUrl = '/#/account';
  var logoutRedirect = '/';

  router.get('/logout', controller.logout);
  router.post('/login', passport.authenticate('local'), controller.login);
  router.post('/signup', passport.authenticate('local-signup'), controller.signup);
  router.post('/forgot-password', controller.forgotPassword);
  router.post('/reset-password/:token', controller.resetPassword);
  router.get('/session', passport.authenticate('session'), controller.session);

  // Facebook /auth/facebook
  router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
  }));
  router.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: redirectUrl,
    failureRedirect: loginUrl
  }));

  // Twitter /auth/twitter
  router.get('/twitter', passport.authenticate('twitter'));
  router.get('/twitter/callback', passport.authenticate('twitter', {
    successRedirect: redirectUrl,
    failureRedirect: loginUrl
  }));

  // Google /auth/google
  router.get('/google', passport.authenticate('google'));
  router.get('/google/callback', passport.authenticate('google', {
    successRedirect: redirectUrl,
    failureRedirect: loginUrl
  }));

  router.get('/redirect', passport.authenticate('session'), controller.redirect);

  module.exports = router;
}());
