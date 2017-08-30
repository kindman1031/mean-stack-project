(function() {
  'use strict';

  var mongoose = require('mongoose');
  var db = require('../../db');
  var debug = require('debug')(APP_NAME.concat(':clothingType.model'));

  // Model Plugins
  var captainHook = require('captain-hook');
  var deepPopulate = require('mongoose-deep-populate');
  var lastMod = require('../../lib/lastMod');
  var readableDate = require('../../lib/readableDate');

  /**
   * Options used for generating schema.
   * @type {{toObject: {getters: boolean, virtuals: boolean}, toJSON: {getters: boolean, virtuals: boolean}}}
   */
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
   * Schema paths
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
      type: String
    },
    price: {
      type: Number,
      required: true
    },
    features: [{
      type: String
    }]
  };

  var schema = mongoose.Schema(schemaPaths, schemaOps);

  schema.plugin(captainHook);
  schema.plugin(deepPopulate);
  schema.plugin(lastMod);
  schema.plugin(readableDate);

  /**
   * Returns schema and model for easy reference in the future.
   * @type {{model: *, schema: *}}
   */
  module.exports = exports = {
    model: db.model('ClothingType', schema),
    schema: schema
  };

}());
