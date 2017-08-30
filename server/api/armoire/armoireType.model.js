(function() {
  'use strict';

  var mongoose = require('mongoose');
  var db = require('../../db');

  // Model Plugins
  var captainHook = require('captain-hook');
  var deepPopulate = require('mongoose-deep-populate');
  var lastMod = require('../../lib/lastMod');
  var readableDate = require('../../lib/readableDate');

  var debug = require('debug')(APP_NAME.concat(':armoireType.model'));

  var schemaOps = {
    toObject: {
      getters: true,
      virtuals: true
    },
    toJSON: {
      getters: true,
      virtuals: true
    }
  };

  /**
   * Schema paths.
   * @type {{createdAt: {type: Date, default: Function}, title: {type: Function, required: boolean}, description: {type: Function, required: boolean}, price: {type: Function, required: boolean}, features: {type: Function}[]}}
   */
  var schemaPaths = {
    createdAt: {
      type: Date,
      'default': Date.now
    },
    enabled: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    stripePackageId: {
      type: String,
      required: false
    },
    features: {
      chargeDryCleaning: {
        type: Boolean,
        default: true
      },
      chargeDeliveries: {
        type: Boolean,
        default: true
      }
    }
  };

  var schema = mongoose.Schema(schemaPaths, schemaOps);

  schema.plugin(captainHook);
  schema.plugin(deepPopulate);
  schema.plugin(lastMod);
  schema.plugin(readableDate);

  module.exports = exports = {
    model: db.model('ArmoireType', schema),
    schema: schema
  };
}());
