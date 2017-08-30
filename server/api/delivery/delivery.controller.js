(function() {
  'use strict';

  var _ = require('lodash');
  var async = require('async');
  // var moment = require('moment');
  var moment = require('moment-timezone');
  var Delivery = require('./delivery.model').model;
  var Clothing = require('../clothing/clothing.model').model;
  var debug = require('debug')(APP_NAME.concat(':delivery.controller'));

  var controller = {};

  /**
   * Find Delivery by ID
   * @param req
   * @param res
   * @param next
   */
  controller.delivery = function(req, res, next, id) {
    Delivery.findById(id, function(err, item) {
      if (err) {
        next(err);
      } else if (item) {
        req.delivery = item;
        next();
      } else {
        next(new Error('failed to load Delivery'));
      }
    });
  };

  /**
   * Returns all Deliveries, sorted by creation date.
   * @param req
   * @param res
   * @param next
   */
  controller.index = function(req, res, next) {
    var queryTerm = new RegExp(req.query.q, 'i');

    Delivery.find({})
      .sort('createdAt')
      .populate('customer armoire')
      .deepPopulate('clothing clothing.type clothing.image')
      .exec(function(err, items) {
        if (err) {
          next(err);
        } else if (items) {
          res.send(items);
        } else {
          next(new Error('failed to load Deliveries'));
        }
      });
  };

  /**
   * Returns delivery based on id.
   * @see module.exports.delivery
   * @param req
   * @param res
   * @param next
   */
  controller.show = function(req, res, next) {
    res.send(req.delivery);
  };

  /**
   * Creates a new Delivery.
   * @param req
   * @param res
   * @param next
   */
  controller.create = function(req, res, next) {
    var newItem = new Delivery(req.body);

    newItem.save(function(err, item) {
      if (err) {
        return next(err);
      }
      res.send(item);
    });
  };

  /**
   * Remove Delivery.
   * @param res
   * @param req
   * @param next
   */
  controller.destroy = function(res, req, next) {
    var item = req.delivery;
    item.enabled = false;
    item.save(function(err) {
      if (err) return next(err);

      res.send(item);
    });
  };


  /**
   * Update Delivery.
   * @param req
   * @param res
   * @param next
   */
  controller.update = function(req, res, next) {
    var item = req.delivery;
    item = _.extend(item, req.body);

    async.waterfall([
      function(done) {
        item.save(function(err, _item) {
          if (err) {
            done(err);
          } else {
            done(null, _item);
          }
        });
      },
      function(savedDelivery, done) {
        if (savedDelivery.delivered) {
          // update clothing items
          Clothing.update({
            '_id': {
              $in: savedDelivery.clothing
            }
          }, {
            $set: {
              status: 'delivered'
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
        } else {
          done(null, savedDelivery);
        }
      }
    ], function(err, savedDelivery) {
      if (err) {
        next(err);
      } else {
        res.send(savedDelivery);
      }
    });
  };

  /**
   * Get open delivery slots over next 2 weeks.
   * @param req
   * @param res
   * @param next
   *
   * // TODO: Allow for 'limit' to be passed and use it as new cut off.
   * // TODO: Move window vars into settings.
   */
  controller.getSlots = function(req, res, next) {
    async.waterfall([
      function(done) {
        Delivery.find({
            enabled: true
          })
          .exec(function(err, deliveries) {
            if (err) {
              next(err);
            } else {
              done(err, deliveries);
            }
          });
      },
      function(deliveries, done) {
        var slots = [];
        var hours = {
          start: 10, // 10am
          end: 20, // 8pm
          window: 2 // How long each delivery should be slotted for.
        };

        // set default timezone
        moment.tz.setDefault("America/Chicago");

        var rightNow = moment().add(1, 'days').hours(hours.start).minute(0).second(0);
        var cutoff = moment(rightNow).add(14, 'days');

        for (rightNow; rightNow.isBefore(cutoff); rightNow.add(hours.window, 'hours')) {
          // Check if we're going beyond the daily cutoff, go to the next day
          if (rightNow.isAfter(moment(rightNow.toString()).hour(hours.end))) {
            rightNow.add(1, 'days').hour(hours.start);
          }

          var foundClash = false;

          // If weekend
          if (rightNow.format('dd') === 'Su' || rightNow.format('dd') === 'Sa') {
            continue;
          }

          _.forEach(deliveries, function(delivery) {
            var endOfSlot = moment(rightNow).add(hours.window, 'hours').subtract(1, 'minutes');
            var deliveryDate = moment(delivery.date).seconds(1);
            foundClash = deliveryDate.isBetween(rightNow, endOfSlot) || foundClash;
          });

          if (!foundClash) {
            slots.push(rightNow.toString());
          }
        }
        res.send(slots);
        return;
      }
    ]);
  };

  /**
   * Gets Deliveries for a user. Should only be called if User is defined in req object.
   */
  controller.byUser = function(req, res, next) {
    if (req.fetchedUser) {
      Delivery.find({
        customer: req.fetchedUser.id
      }, function(err, deliveries) {
        if (err) {
          next(err);
        } else if (deliveries) {
          // req.fetchedUser.delivery = delivery;
          // next();
          res.send(deliveries);
        } else {
          next(new Error('failed to load Deliveries'));
        }
      });
    } else {
      next(new Error('User not defined! Failed to load Deliveries'));
    }
  };

  module.exports = exports = controller;

}());
