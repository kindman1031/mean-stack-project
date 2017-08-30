module.exports = function (app, config, connection) {
  var passport = require('passport')
  var RememberMeStrategy = require('passport-remember-me').Strategy;
  var LocalStrategy = require('passport-local').Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var TwitterStrategy = require('passport-twitter').Strategy;

  var Promise = require('bluebird');
  // Models
  var User = require('../api/user/user.model').model;

  var passportLocalLog = require('debug')('passport:local');
  var passportRmLog = require('debug')('passport:rm');
  var passportFbLog = require('debug')('passport:fb');

  // TODO: Add Twitter strategy
  // TODO: Add Facebook strategy
  // TODO: Add Google+ strategy

  /**
   * Signup
   */
  passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({'local.email': email.toLowerCase()})
        .exec(function (err, user) {
        // if there are any errors, return the error
        if (err) {
          return done(err);
        }

        // check to see if theres already a user with that email
        if (user) {
          return done(null, false);
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();

          // set the user's local credentials
          newUser.firstName       = req.body.firstName;
          newUser.lastName        = req.body.lastName;
          newUser.phone           = req.body.phone;
          newUser.local.email     = email;
          newUser.local.password  = password;
          newUser.loginAt         = Date.now();

          // save the user
          newUser.save(function (err) {
            if (err)
              throw err;
            return done(null, newUser);
          });
        }
      });
    }));

  /**
   * Local Login strategy.
   */
  passport.use('local', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function (req, email, password, done) {
      passportLocalLog('Checking ' + email);

      // find a user whose email is the same as the forms email
      // we are checking to see if the user trying to login already exists
      User.findOne({'local.email': email.toLowerCase()})
        //.select('+local.password')
        .populate('messages')
        .exec(function (err, user) {
          passportLocalLog(user);

          // if there are any errors, return the error before anything else
          if (err)
            return done(err);

          // if no user is found, return the message
          if (!user)
            return done(null, false);

          passportLocalLog('found user. Checking ' + password);

          // if the user is found but the password is wrong
          if (!user.validPassword(password))
            return done(null, false);

          // all is well, return successful user
          user.loginAt = Date.now();
          user.save();
          return done(null, user);
        }
      );
    }));

  /**
   * Facebook strategy
   */
  passport.use('facebook', new FacebookStrategy({
      clientID: config.facebook.app_id,
      clientSecret: config.facebook.app_secret,
      callbackURL: config.facebook.app_callback,
      passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function (req, token, refreshToken, profile, done) {
      passportFbLog('creating validation promise.');
      var validationPromise = new Promise(function (resolve, reject) {
        passportFbLog('validating user:\n  ' + profile.id + '\n  ' + profile.name.givenName);

        var mongooseQueryObject = {
          "facebookId": (typeof profile.id === 'string' ? profile.id : ("" + profile.id))
        };

        User.findOne(mongooseQueryObject).exec(function (err_findOne, user) {
          passportFbLog('Finished querying for facebookId');

          if (err_findOne) {
            passportFbLog('Error querying facebookId == ' + profile.id, err_findOne, err_findOne.stack);
            reject(err_findOne);
            return;
          }

          if (user) {
            passportFbLog('Found user with facebookId == ' + profile.id + ': ' + user);
            resolve(user);
            return;
          }

          passportFbLog('Did NOT user with facebookId == ' + profile.id + '. Will created one.');

          user = new User();

          user.loginAt = Date.now();
          // Bubble up for name
          user.firstName = profile.name.givenName;
          user.lastName = profile.name.familyName;
          // Bubble up Facebook data points
          user.local.email        = profile.emails[0].value;
          // Store in facebook data points
          user.facebookId = profile.id; // set the users facebook id
          user.facebookData.token = token; // we will save the token that facebook provides to the user
          user.facebookData.name = profile.displayName; // look at the passport user profile to see how names are returned
          user.facebookData.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
          //passportFbLog('Profile: ', profile);
          //passportFbLog('Saving newly-created user: ', profile);

          user.save(function (err, userAfterSave) {
            if (err) {
              reject(err);
              return;
            }

            resolve(userAfterSave);
          });
        });
      });

      validationPromise.then(function (user) {
        done(null, user)
      }).catch(function (err) {
        done(err);
      });

    }
  ));

  // Passport session setup.
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      if (err) {
        done(err);
      } else if (!user) {
        err = new Error('User not found when deserializing.');
        done(null, user);
      } else {
        done(null, user);
      }
    });
  });

  app.get('debug:log')('config/passport ran successfully');
};
