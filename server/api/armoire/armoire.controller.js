(function() {
  'use strict';

  var _ = require('lodash');
  var async = require('async');

  var Armoire = require('./armoire.model').model;
  var ArmoireType = require('./armoireType.model').model;
  var Clothing = require('../clothing/clothing.model').model;
  var Delivery = require('../delivery/delivery.model').model;
  var User = require('../user/user.model').model;
  var notificationController = require('../notification/notification.controller.js');
  var config = require('../../config/environment');
  var stripe = include('common').lib.stripe;

  var debug = require('debug')(APP_NAME.concat(':armoire.controller'));

  var controller = {};

  /**
   * Find Armoire by ID
   * @param req
   * @param res
   * @param next
   * @param id
   */
  controller.armoire = function(req, res, next, id) {
    Armoire.findById(id)
      .populate('owner')
      .populate('type')
      .deepPopulate('items items.type items.image deliveries deliveries.clothing')
      .exec(function(err, item) {
        if (err) {
          next(err);
        } else if (item) {
          req.armoire = item;
          next();
        } else {
          next(new Error('failed to load Armoire'));
        }
      });
  };

  /**
   * Returns all Armoires, sorted by creation date.
   * @param req
   * @param res
   * @param next
   */
  controller.index = function(req, res, next) {
    var queryTerm = new RegExp(req.query.q, 'i');

    Armoire.find({})
      .sort('createdAt')
      .populate('type')
      .deepPopulate('items items.type items.image deliveries deliveries.clothing')
      .exec(function(err, items) {
        if (err) {
          next(err);
        } else if (items) {
          res.send(items);
        } else {
          next(new Error('failed to load Armoires'));
        }
      });
  };

  /**
   * Returns delivery based on id.
   * @see module.exports.show
   * @param req
   * @param res
   * @param next
   */
  controller.show = function(req, res, next) {
    res.send(req.armoire);
  };

  /**
   * Creates a new Armoire.
   * @param req
   * @param res
   * @param next
   */
  controller.create = function(req, res, next) {
    var newItem = new Armoire(req.body);
    if (_.isEmpty(newItem.owner)) {
      newItem.owner = req.user.id;
    }

    async.waterfall([
      function(done) {
        // make sure armoire is valid
        var error = newItem.validateSync();
        if (error) {
          next(error);
        } else {
          done(error, newItem);
        }
      },
      function(armoireToSave, done) {
        // get ArmoireType
        ArmoireType.findById(armoireToSave.type, function(err, aType) {
          if (err) {
            done(err);
          } else if (!aType.stripePackageId) {

          } else {
            done(null, aType.stripePackageId);
          }
        });
      },
      function(stripePackageId, done) {
        // create stripe subscription
        stripe.customers.createSubscription(
          req.user.stripeId, {
            plan: stripePackageId
          },
          function(err, subscription) {
            if (err) {
              done(err);
            } else {
              done(null, subscription);
            }
          }
        );
      },
      function(subscription, done) {
        // add stripeSubscriptionId and save armoire
        newItem.stripeSubscriptionId = subscription.id;
        newItem.save(function(err, savedArmoire) {
          if (err) {
            next(err);
          } else {
            done(err, savedArmoire);
          }
        });
      },
      function(savedArmoire, done) {
        User.findByIdAndUpdate(newItem.owner, {
          $push: {
            'armoires': savedArmoire
          }
        }, function(err, updatedUser) {
          if (err) {
            next(err);
          } else {
            done(err, savedArmoire);
          }
        });
      },
      function saveDelivery(savedArmoire, done) {
        var d = new Delivery({
          customer: req.user.id,
          date: new Date(req.body.deliveryTime),
          armoire: savedArmoire.id,
          address: req.user.address
        });

        d.save(function(err, resp) {
          if (err) {
            done(err);
            return;
          }
          // send notification
          notificationController.pickupNotification({
            title: 'Pickup Notification',
            headerTitle: 'Pickup Notification',
            customer: req.user,
            deliveryTime: req.body.deliveryTime,
            address: req.user.address,
            link: {
              url: config.domain + '/admin/delivery',
              text: 'Details'
            }
          });
          done(null, savedArmoire);
        });
      }
    ], function(err, savedArmoire) {
      if (err) {
        debug(err);
        next(err);
      } else {
        res.send(savedArmoire);
      }
    });
  };

  /**
   * Remove Armoire.
   * @param res
   * @param req
   * @param next
   */
  controller.destroy = function(res, req, next) {
    var item = req.armoire;
    async.waterfall([
      function(done) {
        item.enabled = false;
        item.save(function(err, updatedItem) {
          if (err) {
            return next(err);
          }
          done(err, updatedItem);
        });
      },
      function(updatedItem, done) {
        User.findByIdAndUpdate(item.owner, {
          $pull: {
            'armoires': updatedItem
          }
        }, function(err, updatedUser) {
          if (err) {
            next(err);
          } else {
            res.send('success');
            return;
          }
        });
      }
    ]);
  };


  /**
   * Update Armoire.
   * @param req
   * @param res
   * @param next
   */
  controller.update = function(req, res, next) {
    var item = req.armoire;
    item = _.merge(item, req.body, _.merge);
    item.save(function(err) {
      if (err) return next(err);

      res.send(item);
    });
  };

  /**
   * Gets Armoires for a user. Should only be called if User is defined in req object.
   * @param req
   * @param res
   * @param next
   */
  controller.byUser = function(req, res, next) {
    if (req.fetchedUser) {
      Armoire.find({
          owner: req.fetchedUser.id
        })
        .populate('type')
        .deepPopulate('items items.type items.image deliveries deliveries.clothing')
        .exec(function(err, armoires) {
          if (err) {
            next(err);
          } else if (armoires) {
            // req.fetchedUser.armoire = armoire;
            // next();
            res.send(armoires);
          } else {
            next(new Error('failed to load Armoires'));
          }
        });
    } else {
      next(new Error('User not defined! Failed to load Armoires'));
    }
  };

  /**
   * Add delivery.
   * @param req
   * @param res
   * @param next
   */
  controller.addDelivery = function(req, res, next) {
    async.waterfall([
      function(done) {
        var d = new Delivery({
          customer: req.user.id,
          date: new Date(req.body.deliveryTime),
          armoire: req.armoire.id,
          clothing: req.body.items,
          address: req.user.address
        });

        d.save(function(err, resp) {
          if (err) {
            done(err);
            return;
          }
          done(null, d);
        });
      },
      function(savedDelivery, done) {
        // update clothing items
        Clothing.update({
          '_id': {
            $in: savedDelivery.clothing
          }
        }, {
          $set: {
            status: 'indelivery'
          }
        }, {
          multi: true
        }, function(err, items) {
          if (err) {
            done(err);
            return;
          }
          done(null, savedDelivery);
        });
      },
      function(savedDelivery, done) {
        // deep populate delivery
        savedDelivery.deepPopulate('clothing clothing.type clothing.image', function(err, completeDelivery) {
          if (err) {
            done(err);
          } else {
            // send notification
            notificationController.deliveryNotification({
              title: 'Delivery Request Notification',
              headerTitle: 'Delivery Request Notification',
              customer: req.user,
              deliveryTime: completeDelivery.deliveryTime,
              address: completeDelivery.address,
              items: completeDelivery.clothing,
              link: {
                url: config.domain + '/admin/delivery',
                text: 'Details'
              }
            });
            done(null, completeDelivery);
          }
        });
      },
      function(completeDelivery, done) {
        Armoire.findByIdAndUpdate(req.armoire.id, {
          $push: {
            'deliveries': completeDelivery
          }
        }, function(err, updatedArmoire) {
          if (err) {
            done(err);
          } else {
            done(null, updatedArmoire);
          }
        });
      },
      function(updatedArmoire, done) {
        // get full updated armoire
        updatedArmoire.populate('owner')
          .populate('type')
          .deepPopulate('items items.type items.image deliveries', function(err, completeArmoire) {
            if (err) {
              done(err);
            } else {
              done(null, completeArmoire);
            }
          });
      }
    ], function(err, completeArmoire) {
      if (err) {
        debug(err);
        next(err);
      } else {
        res.send(completeArmoire);
      }
    });
  };

  /**
   * Reads user.seed.json and seeds database off that.
   **/
  controller.seed = function() {
    debug('seed::START');
    var seedFile = require('./armoire.seed.json');
    debug(seedFile);
    ///*
    _.forEach(seedFile.armoireTypes, function(seed) {
      var newSeed = new ArmoireType(seed);
      newSeed.save(function(err, seeded) {
        if (seeded) {
          debug("Created " + seeded.title);
        }
      });
    });
    debug('seed::STOP');
    //*/
  };

  module.exports = controller;
}());
