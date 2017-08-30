(function() {
  'use strict';

  var mongoose = require('mongoose');
  var moment = require('moment');
  var _ = require('lodash');
  var db = require('../../db');
  var lastMod = require('../../lib/lastMod');
  var readableDate = require('../../lib/readableDate');
  var deepPopulate = require('mongoose-deep-populate');

  var debug = require('debug')(APP_NAME.concat(':delivery.model'));

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

  var schemaPaths = {
    enabled: {
      type: Boolean,
      default: true
    },
    canceled: {
      type: Boolean,
      default: false
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    armoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Armoire'
    },
    clothing: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clothing'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    date: {
      type: Date
    },
    active: {
      type: Boolean,
      default: false
    },
    deliveredAt: {
      type: Date
    },
    address: {
      street_1: {
        type: String,
        require: true
      },
      street_2: {
        type: String,
        require: false
      },
      city: {
        type: String,
        require: true
      },
      state: {
        type: String,
        require: true
      },
      country: {
        type: String,
        require: true
      },
      zip: {
        type: String,
        require: true
      }
    }
  };

  var schema = mongoose.Schema(schemaPaths, schemaOps);

  schema.plugin(readableDate);
  schema.plugin(lastMod);
  schema.plugin(deepPopulate);

  schema.virtual('delivered').get(function() {
    return _.isDate(this.deliveredAt);
  });

  module.exports = exports = {
    model: db.model('Delivery', schema),
    schema: schema
  };

}());
