(function() {
  'use strict';

  var mongoose = require('mongoose');
  var db = require('../../db');
  // Model Plugins
  var captainHook = require('captain-hook');
  var deepPopulate = require('mongoose-deep-populate');
  var lastMod = require('../../lib/lastMod');
  var readableDate = require('../../lib/readableDate');

  var debug = require('debug')(APP_NAME.concat(':armoire.model'));

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

  var schema = mongoose.Schema({
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArmoireType',
      required: true
    },
    createdAt: {
      type: Date,
      'default': Date.now
    },
    active: {
      type: Boolean,
      default: true
    },
    name: {
      type: String,
      required: true
    },
    deliveries: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delivery'
    }],
    charged: {
      type: Boolean,
      default: false
    },
    stripeSubscriptionId: {
      type: String
    },
    items: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clothing'
    }]
  }, schemaOps);
  // ensure armoire name is unique per customer
  schema.index({
    owner: 1,
    name: 1
  }, {
    unique: true
  });

  schema.plugin(captainHook);
  schema.plugin(deepPopulate);
  schema.plugin(lastMod);
  schema.plugin(readableDate);

  module.exports = exports = {
    model: db.model('Armoire', schema),
    schema: schema
  };
}());
