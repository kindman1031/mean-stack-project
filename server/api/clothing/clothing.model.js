(function() {
  'use strict';

  var mongoose  = require('mongoose');
  var db        = require('../../db');
  var debug     = require('debug')(APP_NAME.concat(':clothing.model'));

  // Model Plugins
  var captainHook   = require('captain-hook');
  var deepPopulate  = require('mongoose-deep-populate');
  var lastMod         = require('../../lib/lastMod');
  var readableDate    = require('../../lib/readableDate');

  /**
   * Options used for Schema creation.
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
   * Schema paths.
   * @type {{armoire: {type: (Types.ObjectId|*|p.ObjectId|.exports.ObjectId|exports.ObjectId|ObjectId), ref: string}, type: {type: (Types.ObjectId|*|p.ObjectId|.exports.ObjectId|exports.ObjectId|ObjectId), ref: string, required: boolean}, createdAt: {type: Date, default: Function}, modifiedAt: {type: Date, default: Function}, active: {type: Function, default: boolean}, name: {type: Function, required: boolean}, modified: {type: Date, default: Function}, images: {type: (Types.ObjectId|*|p.ObjectId|.exports.ObjectId|exports.ObjectId|ObjectId), ref: string}[]}}
   */
  var schemaPaths = {
    armoire     : { type: mongoose.Schema.Types.ObjectId, ref: 'Armoire' },
    type        : { type: mongoose.Schema.Types.ObjectId, ref: 'ClothingType', required: true },
    createdAt   : { type: Date, default: Date.now },
    modifiedAt  : { type: Date, default: Date.now },
    enabled     : { type: Boolean, default: true },
    name        : { type: String, required: true },
    modified    : { type: Date, default: Date.now },
    tags        : [ { type: String } ],
    status      : { type: String, enum: ['inarmoire', 'indelivery', 'delivered'], default: 'inarmoire' },
    image       : { type: mongoose.Schema.Types.ObjectId, ref: 'Image' }
  };

  /**
   * The Schema
   */
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
    model: db.model('Clothing', schema),
    schema: schema
  };
}());
