var accessLevels = require('../../client/javascripts/routingConfig').accessLevels;
var passport = require('passport');
var debug = require('debug')('lib.auth :: ');
var async = require('async');
/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
var ensureAuthenticated = function (req, res, next) {
  async.waterfall([
      function isAuthenticated(callback) {
        debug('ensureAuthenticated.isAuthenticated()');

        if (req.isAuthenticated()) {
          debug('ensureAuthenticated.isAuthenticated():true');
          callback(null);
        } else {
          debug('ensureAuthenticated.isAuthenticated():false');
          passport.authenticate('basic', {})(req, res, callback);
        }
      }
    ],
    function fin(err) {
      debug('ensureAuthenticated.fin()', err);
      if (err) {
        res.status(401).send(err);
      } else {
        next();
      }
    });
};

/**
 *
 * @param role object Pass in a role from routingConfig.useRoles
 * @param req
 * @param res
 * @param next
 * @returns {true,false}
 */
var authorize = function (accessLevel, fallback) {
  return function (req, res, next) {
    if (accessLevel === accessLevels.anon || accessLevel === accessLevels.public) {
      return next();
    }

    if (ensureAuthenticated(req, res, next)) {
      if (accessLevel.bitMask & req.user.role.bitMask) {
        return next();
      } else if (fallback) {
        fallback(req, res, next)
      } else {
        res.send(403);
      }
    }
  }
};

/**
 * Makes sure the logged in user is the same as the fetchedUser from params.
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
var ensureCurrentUser = function (req, res, next) {
  if (req.fetchedUser && req.isAuthenticated()) {
    if (req.fetchedUser.id === req.user.id) {
      return next();
    }
  }
  res.send(403);
};

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.authorize = authorize;
module.exports.ensureCurrentUser = ensureCurrentUser;
