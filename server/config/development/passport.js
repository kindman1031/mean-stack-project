module.exports = function (app, config, connection) {
  var passport = require('passport');
  var BasicStrategy = require('passport-http').BasicStrategy;
  var passportBasicLog = require('debug')('passport:basic');

  /**
   * BASIC auth strategy
   */
  passport.use('basic', new BasicStrategy(
    function(username, password, done) {
      passportBasicLog('checking username:', username,  'password:', password);

      process.nextTick(function () {
        User.findOne({ 'local.email': username.toLowerCase() }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (!user.validPassword(password)) { return done(null, false); }
          return done(null, user);
        });
      });
    }
  ));
};
