(function() {
  'use strict';

  var _ = require('lodash');
  var ArmoireType = require('../armoire/armoireType.model').model;
  var ClothingType = require('../clothing/clothingType.model').model;
  var stripe = include('common').lib.stripe;
  var async = require('async');
  var debug = require('debug')(APP_NAME.concat(':pricing.controller'));

  var controller = {};

  var config = require('../../config/environment');
  var packagePrefix = config.stripe.packagePrefix;
  /**
   * Find ArmoireType by ID
   * @param req
   * @param res
   * @param next
   * @param id
   */
  controller.armoireType = function(req, res, next, id) {
    ArmoireType.findById(id, function(err, item) {
      if (err) {
        next(err);
      } else if (item) {
        req.armoireType = item;
        next();
      } else {
        next(new Error('failed to load ArmoireType'));
      }
    });
  };

  /**
   * Returns fetched ArmoireType
   * @param req
   * @param res
   */
  controller.showArmoireType = function(req, res) {
    res.send(req.armoireType);
  };

  /**
   * Find ClothingType by ID
   * @param req
   * @param res
   * @param next
   * @param id
   */
  controller.clothingType = function(req, res, next, id) {
    ClothingType.findById(id, function(err, item) {
      if (err) {
        next(err);
      } else if (item) {
        req.clothingType = item;
        next();
      } else {
        next(new Error('failed to load ClothingType'));
      }
    });
  };

  /**
   * Returns fetched ClothingType
   * @param req
   * @param res
   */
  controller.showClothingType = function(req, res) {
    res.send(req.clothingType);
  };

  /**
   * Returns list of ArmoireTypes
   * @param req
   * @param res
   * @param next
   */
  controller.getArmoireTypes = function(req, res, next) {
    ArmoireType.find({
        enabled: true
      })
      .sort('createdAt')
      .exec(function(err, ciTypes) {
        if (err) {
          next(err);
        } else if (ciTypes) {
          res.send(ciTypes);
        }
      });
  };

  /**
   * Creates a new ArmoireType
   * @param req
   * @param res
   * @param next
   */
  controller.createArmoireType = function(req, res, next) {
    var at = new ArmoireType(req.body);
    var stripePackageId = false;
    // make sure price is fixed 2
    at.price = at.price.toFixed(2);
    async.waterfall([
      function(done) {
        // save armoireType
        at.save(function(err, savedAT) {
          if (err) {
            debug(err);
            done(err);
          } else {
            done(null, savedAT);
          }
        });
      },
      function(savedAT, done) {
        // create stripe plan
        controller.createStripePlan(savedAT, done);
      },
      function(stripePlan, done) {
        // update ArmoireType
        at.stripePackageId = stripePlan.id;
        at.save(function(err, savedAT) {
          if (err) {
            debug(err);
            done(err);
          } else {
            done(null, savedAT);
          }
        });
      }
    ], function(err, savedAt) {
      if (err) {
        debug(err);
        next(err);
      } else if (savedAt) {
        res.send(savedAt);
      }
    });
  };

  /**
   * Updates the armoireType declared in the req. Gotten through route params.
   * @param req
   * @param res
   * @param next
   */
  controller.updateArmoireType = function(req, res, next) {
    if (req.armoireType) {
      var item = req.armoireType;
      item = _.extend(item, req.body);
      // make sure price is fixed 2
      item.price = item.price.toFixed(2);
      // make sure we have a stripePackageId to save
      if(!item.stripePackageId){
        var packageObj = controller.generatePackageObj(item);
        item.stripePackageId = packageObj.id;
      }

      async.waterfall([
        function(done) {
          item.save(function(err, savedItem) {
            if (err) {
              done(err);
            }
            done(null, savedItem);
          });
        },
        function(savedItem, done) {
          // delete stripe package
          debug('try to delete package');
          debug(savedItem.toJSON());
          if(typeof savedItem.stripePackageId !== 'undefined'){
            controller.destroyStripePlan(savedItem.stripePackageId, done, true);
          }else{
            done(null, true);
          }
        },
        function(confirmation, done) {
          // create stripe plan
          controller.createStripePlan(item, done);
        }
      ], function(err, savedItem) {
        if (err) {
          debug(err);
          next(err);
        } else {
          res.send(savedItem);
        }
      });
    } else {
      next(new Error('armoireType not in request'));
    }
  };

  /**
   * Destroys an ArmoireType
   * @param req
   * @param res
   * @param next
   */
  controller.destroyArmoireType = function(req, res, next) {
    if (req.armoireType) {
      var item = req.armoireType;
      item.enabled = false;

      async.waterfall([
        function(done){
          item.save(function(err, savedItem) {
            if (err) {
              done(err);
            }
            done(null, savedItem);
          });
        }, function(savedItem, done) {
          // delete stripe package
          if(typeof savedItem.stripePackageId !== 'undefined'){
            controller.destroyStripePlan(savedItem.stripePackageId, done, true);
          }else{
            done(null, true);
          }
        },
      ], function(err, savedItem){
        if (err) {
          debug(err);
          next(err);
        } else {
          res.send(savedItem);
        }
      });
    } else {
      next(new Error('armoireType not in request'));
    }
  };

  /**
   * Returns all clothing types
   * @param req
   * @param res
   * @param next
   */
  controller.getClothingTypes = function(req, res, next) {
    ClothingType.find({
        enabled: true
      })
      .sort('createdAt')
      .exec(function(err, ciTypes) {
        if (err) {
          next(err);
        } else if (ciTypes) {
          res.send(ciTypes);
        }
      });
  };

  /**
   * Creates a new ClothingType.
   * @param req
   * @param res
   * @param next
   */
  controller.createClothingType = function(req, res, next) {
    var at = new ClothingType(req.body);
    at.save(function(err, createdItem) {
      if (err) {
        next(err);
      } else if (createdItem) {
        res.send(createdItem);
      }
    });
  };

  /**
   * Updates the clothingType declared in the req. Gotten through route params.
   * @param req
   * @param res
   * @param next
   */
  controller.updateClothingType = function(req, res, next) {
    if (req.clothingType) {
      var item = req.clothingType;
      item = _.extend(item, req.body);

      item.save(function(err, savedItem) {
        if (err) return next(err);

        res.send(savedItem);
      });
    } else {
      next(new Error('clothingType not in request'));
    }
  };

  /**
   * Destroys an ClothingType
   * @param req
   * @param res
   * @param next
   */
  controller.destroyClothingType = function(req, res, next) {
    if (req.clothingType) {
      var item = req.clothingType;
      item.enabled = false;
      item.save(function(err, savedItem) {
        if (err) return next(err);

        res.send(item);
      });
    } else {
      next(new Error('clothingType not in request'));
    }
  };

  /**
   * Creates Stripe package
   * @param armoireTypeModel
   * @param next
   */
  controller.createStripePlan = function(armoireTypeModel, next) {
    // create stripe plan
    var packageObj = controller.generatePackageObj(armoireTypeModel);
    stripe.plans.create(packageObj, function(err, stripePlan) {
      if (err) {
        debug(err);
        next(err);
      } else {
        next(null, stripePlan);
      }
    });
  };

  /**
   * Destroys Stripe package
   * @param armoireTypeModel
   * @param next
   */
  controller.destroyStripePlan = function(packageId, next, continueEvenIfError) {
    continueEvenIfError = continueEvenIfError || false;
    // create stripe plan
    stripe.plans.del(
      packageId,
      function(err, confirmation) {
        if (!continueEvenIfError && err) {
          debug(err);
          next(err);
        } else {
          next(null, confirmation);
        }
      }
    );
  };

  controller.generatePackageObj = function(armoireTypeModel) {
    return {
      amount: armoireTypeModel.price * 100, // price in centes
      interval: "month",
      name: packagePrefix + armoireTypeModel.title,
      currency: "usd",
      id: packagePrefix + armoireTypeModel.title.replace(/ /g, '').toLowerCase()
    };
  };

  module.exports = controller;

}());
