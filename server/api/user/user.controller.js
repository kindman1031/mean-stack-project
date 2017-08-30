(function() {
  'use strict';

  var debug = require('debug')(APP_NAME.concat(':user.controller'));

  var _ = require('lodash');
  _.mergeDefaults = require('merge-defaults');
  var fs = require('fs');
  var async = require('async');
  var stripe = include('common').lib.stripe;
  var User = require('./user.model').model;
  var Armoire = require('../armoire/armoire.model').model;
  var Delivery = require('../delivery/delivery.model').model;
  var SupportConvo = require('../supportConvo/supportConvo.model').model;
  var Message = require('../message/message.model').model;
  var Image = require('../image/image.model').model;
  var AvatarUploader = require('../../lib/avatarUploader');
  var aws = require('../../lib/aws');


  var notificationController = require('../notification/notification.controller.js');
  var config = require('../../config/environment');

  var controller = {};

  /**
   * Find user by ID
   * @param req
   * @param res
   * @param next
   */
  controller.fetchedUser = function(req, res, next, id) {
    async.waterfall([
      function getUser(done) {
        debug('fetchedUser.getUser');
        User.findById(id, done);
      },
      function populateUser(user, done) {
        debug('fetchedUser.populateUser');
        User.deepPopulate(user,
          'avatar armoires armoires.type armoires.items armoires.items.image armoires.items.type armoires.deliveries' +
          'supportConvo supportConvo.messages',
          done);
      },
      function getDelivery(populatedUser, done) {
        debug('fetchedUser.getDelivery');
        req.fetchedUser = populatedUser;
        Delivery.find({
          customer: populatedUser.id
        }, done);
      },
      function populateDeliveries(deliveries, done) {
        Delivery.populate(deliveries, 'armoire clothing customer', done);
      }
    ], function fin(err, deliveries) {
      //debug('fetchedUser.fin', deliveries);
      if (err) {
        next(err);
      } else {
        req.fetchedUser.deliveries = deliveries;
        //debug('req.fetchedUser', req.fetchedUser);
        next();
      }
    });
  };

  /**
   * Creates a new User.
   * @param req
   * @param res
   * @param next
   */
  controller.create = function(req, res, next) {
    var newItem = new User(req.body);

    newItem.save(function(err, item) {
      if (err) {
        return next(err);
      }
      res.send(item);
    });
  };

  /**
   * Returns all users, sorted by creation date.
   * @param req
   * @param res
   * @param next
   */
  controller.index = function(req, res, next) {
    var queryTerm = new RegExp(req.query.q, 'i');

    User.find({})
      .or([{
        'lastName': {
          $regex: queryTerm
        }
      }, {
        'firstName': {
          $regex: queryTerm
        }
      }, {
        'localData.email': {
          $regex: queryTerm
        }
      }, {
        'facebookData.email': {
          $regex: queryTerm
        }
      }, {
        'googleData.email': {
          $regex: queryTerm
        }
      }, {
        'twitterData.email': {
          $regex: queryTerm
        }
      }])
      .sort('createdAt')
      .deepPopulate([
        'supportConvo', 'supportConvo.messages', 'supportConvo.messages'
      ])
      .exec(function(err, users) {
        if (err) {
          next(err);
        } else if (users) {
          res.send(users);
        } else {
          next(new Error('failed to load users'));
        }
      });
  };

  /**
   * Returns user based on id.
   * @see module.exports.user
   * @param req
   * @param res
   * @param next
   */
  controller.show = function(req, res) {
    res.send(req.fetchedUser);
  };

  /**
   * Remove user.
   * @param res
   * @param req
   * @param next
   */
  controller.destroy = function(res, req, next) {
    var item = req.fetchedUser;
    item.enabled = false;
    item.save(function(err) {
      if (err) return next(err);

      res.send(item);
    });
  };

  /**
   * Updates user.
   * @param req
   * @param res
   * @param next
   */
  controller.update = function(req, res, next) {
    var item = req.fetchedUser;
    item = _.merge(item, req.body);

    item.save(function(err, savedItem) {
      if (err) return next(err);
      delete savedItem.local.password;
      res.send(savedItem);
    });
  };

  /**
   * Updates user's avatar.
   * @param req
   * @param res
   * @param next
   */
  controller.updateAvatar = function(req, res, next) {
    if (!req.fetchedUser) {
      return next(new Error('Unknown user'));
    }

    if (!req.body.img) {
      return next(new Error('No image'));
    }

    var filename = req.body.img.name;
    var ext = filename.split('.').pop();
    var url = abs_path('uploads/images/') + filename;
    var originalBuffer = new Buffer(req.body.img.uri, "base64");
    var cleanBuffer = new Buffer(req.body.img.uri.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), "base64");

    async.waterfall([
      function saveToDisk(done) {
        fs.writeFile(url, cleanBuffer, function(err) {
          if (err) {
            debug('ERROR', err);
            return;
          } else {
            done(err);
          }
        });
      },
      function createNewImage(done) {
        var img = new Image();
        img.save(function(err, savedImg) {
          if (err) {
            next(err);
            return;
          }
          done(err, savedImg);
        });
      },
      function resize(savedImg, done) {
        var uploader = new AvatarUploader();
        uploader.process(savedImg.id, url, function(err, sizedImages) {
          if (err) {
            savedImg.remove();
            debug(err);
            next(err);
            return;
          }
          debug(sizedImages);
          done(err, savedImg, sizedImages);
        });
      },
      function updateImage(savedImg, sizedImages, done) {
        _.merge(savedImg, sizedImages);
        savedImg.save(function(err, updatedImg) {
          if (err) {
            next(err);
            return;
          }
          done(err, updatedImg);
        });
      },
      function saveUser(updatedImg, done) {
        var item = req.fetchedUser;
        item.avatar = updatedImg;

        item.save(function(err, updatedUser) {
          if (err) {
            done(err);
          } else {
            // get full user object
            User.populate(updatedUser, {
              path: 'avatar'
            }, function(err, savedUser) {
              done(err, savedUser);
            });
          }
        });
      }
    ], function(err, savedUser) {
      // Cleanup
      fs.unlinkSync(url);

      if (err) {
        debug(err);
        next(err);
      } else {
        res.send(savedUser);
      }
    });
  };

  controller.getMessages = function(req, res, next) {
    if (req.fetchedUser) {
      SupportConvo.find({
        'owner': req.fetchedUser.id
      }).deepPopulate([
        'supportConvo', 'supportConvo.messages', 'supportConvo.messages.owner'
      ]).exec(function(err, messages) {
        if (err) {
          next(err);
          return;
        } else if (messages) {
          res.send(messages);
        }
      });
    } else {
      res.send([]);
    }

  };

  controller.postMessage = function(req, res, next) {
    async.waterfall([
      function validate(done) {
        debug('postMessage::validate');
        // Valid fetched user
        if (!req.fetchedUser) {
          next(new Error('No user to send to'));
          return;
        } else {
          done(null);
        }
      },
      function createMessage(done) {
        debug('postMessage::createMessage');
        var msg = new Message({
          content: req.body.message
        });

        if (req.user) {
          msg.owner = req.user.id;
        }

        msg.save(done);
      },
      function updateSupportConvo(msg, done) {
        debug('postMessage::updateSupportConvo');
        SupportConvo.findByIdAndUpdate(req.fetchedUser.supportConvo.id, {
          $push: {
            'messages': msg
          }
        }, function(err, resp) {
          if (err) {
            next(err);
            return;
          }

          // send notification
          notificationController.adminSupportNotification({
            title: 'Support Notification',
            headerTitle: 'Support Notification',
            customer: req.user,
            message: msg,
            link: {
              url: config.domain + '/admin/customers/' + req.user.id + '/support-convo',
              text: 'Full Conversation'
            }
          });

          res.send(msg);
          return;
        });
      }
    ]);
  };


  /**
   * Checks if the user has a stripeID. Needs to be called before any charges, stripe lookups are done.
   * @param req
   * @param res
   * @param next
   */
  controller.requireStripe = function(req, res, next) {
    async.waterfall([
      function checkStripeId(done) {
        if (!_.isEmpty(req.fetchedUser.stripeId)) {
          debug('User has stripeId: ', req.fetchedUser.stripeId);
          //done(null);
          // Make call to verify they actually are in the DB.
          stripe.customers.retrieve(req.fetchedUser.stripeId).then(
            function(data) {
              // Successfully retrieved the user, pass it on.
              done(null, req.fetchedUser.stripeId);
            },
            function(stripeErr) {
              debug('Error retrieving stripeId user ' + req.fetchedUser.local.email);

              // Check if the error has to do with a stripeId not existing
              if (stripeErr.message.toLowerCase().lastIndexOf("no customer")) {
                delete req.fetchedUser.stripeId;
                req.fetchedUser.save(function(err) {
                  if (err) {
                    // Error saving the user
                    done(err, null);
                    return;
                  }
                  // We've updated the user after getting a bad response from retrieving the user from Stripe.
                  // So we pass no stripeId to the next function because we want to create a new one.
                  done(null, null);
                });
              } else {
                // Some other error, pass it through
                done(stripeErr);
              }

            }
          );
        } else {
          // No stripeId for user, create one by passing no stripeId.
          done(null, null);
        }
      },
      function createStripeID(stripeId, done) {
        if (stripeId) {
          done(null, req.fetchedUser.stripeId);
        } else {
          debug('Creating for ' + req.fetchedUser.local.email);
          stripe.customers.create({
            description: 'Customer for ' + req.fetchedUser.local.email,
            email: req.fetchedUser.local.email
          }, function(stripeErr, customer) {
            if (stripeErr) {
              next(stripeErr);
              return;
            }
            debug('Created stripeId for user: ', customer);
            req.fetchedUser.stripeId = customer.id;
            req.fetchedUser.save(function(err, savedUser) {
              if (err) {
                done(err);
                return;
              }
              req.fetchedUser = savedUser;
              done(null, req.fetchedUser.stripeId);
            });

          });
        }
      }
    ], function fin(err, stripeId) {
      if (err) {
        next(err);
        return;
      }
      next();
    });
  };

  /**
   * Retrieves billing information for user from Stripe.com API.
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */
  controller.getBilling = function(req, res, next) {
    async.waterfall([
        function(done) {
          // Get stripe profile
          stripe.customers.retrieve(req.fetchedUser.stripeId).then(
            function(data) {
              done(null, data);
            },
            function(err) {
              done(err);
            }
          );
        },
        function(data, done) {
          // Get cards
          stripe.customers.listCards(req.fetchedUser.stripeId).then(
            function(resp) {
              data.cards = resp;
              done(null, data);
            },
            function(err) {
              done(err);
            }
          );
        },
        function(data, done) {
          // Get charges
          stripe.charges.list({
            limit: 100,
            customer: req.fetchedUser.stripeId
          }).then(
            function(resp) {
              data.charges = resp;
              done(null, data);
            },
            function(err) {
              done(err);
            }
          );
        }
      ],
      function fin(err, data) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.send({
          'billingData': data
        });
      });
  };

  /**
   * Updates billing information for user from Stripe.com API.
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */
  controller.updateBilling = function(req, res, next) {
    var fetchedUser = req.fetchedUser;
    var card = {
      number: req.body.number,
      exp_month: req.body.exp_month,
      exp_year: req.body.exp_year,
      cvc: req.body.cvc,
      name: req.body.name
    };

    if (req.body.id) {
      // Existing card
      if (card.number.toLowerCase().lastIndexOf('xxxx') > -1) {
        delete card.number;
      }
      stripe.customers.updateCard(fetchedUser.stripeId, {
        card: card
      }).then(function(card) {
          //user.updateStripeCard();
          fetchedUser.stripeCard = card.id;
          fetchedUser.save();
          return res.send(card);
        },
        function(err) {
          return err;
        });
    } else {
      stripe.customers.createCard(fetchedUser.stripeId, {
        card: card
      }).then(function(card) {
          //user.updateStripeCard();
          fetchedUser.stripeCard = card.id;
          fetchedUser.save();
          return res.send(card);
        },
        function(err) {
          return res.status(500).send(err);
        });
    }
  };

  /**
   * Charges a user from Stripe API.
   * @param req
   * @param res
   * @param next
   * @returns {*}
   */
  controller.createCharge = function(req, res, next) {
    var fetchedUser = req.fetchedUser;

    async.waterfall([
        function(done) {
          // get cards from stripe
          stripe.customers.listCards(req.fetchedUser.stripeId).then(
            function(cards) {
              var card = cards.data[0] || {};
              done(null, card);
            },
            function(err) {
              done(err);
            }
          );
        },
        function(data, done) {
          // make sure amount is in cents
          var amount = Math.ceil(parseFloat(req.body.amount).toFixed(2) * 100);
          var chargeObj = {
            amount: amount,
            currency: "usd",
            customer: req.fetchedUser.stripeId, // stripe customer ID
            source: data.id, // stripe customer's card ID
            description: req.body.description
          };
          // charge customer
          stripe.charges
            .create(chargeObj)
            .then(function(charge) {
                done(null, charge);
              },
              function(err) {
                done(err);
              });
        }
      ],
      function fin(err, data) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.send({
          latestCharge: data
        });
      }
    );
  };

  /**
   * Reads user.seed.json and seeds database off that.
   **/
  controller.seed = function() {
    debug('seed::START');
    var seedFile = require('./user.seed.json');
    debug(seedFile);
    //debug(require('./user.seed.json').users);
    ///*
    _.forEach(seedFile.users, function(seed) {
      var newSeed = new User(seed);
      newSeed.save(function(err, seeded) {
        if (seeded) {
          debug("Created " + seeded.local.email);
        }
      });
    });
    debug('seed::STOP');
    //*/
  };


  module.exports = controller;

}());
