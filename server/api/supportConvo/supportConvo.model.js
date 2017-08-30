(function() {
  'use strict';

  var common = require('../../../common');
  var empty = common.lib.utils.empty;
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  var ObjectId = Schema.Types.ObjectId;
  var captainHook = require('captain-hook');
  var deepPopulate = require('mongoose-deep-populate');
  var db = require('../../db');
  var lastMod = require('../../lib/lastMod');
  var readableDate = require('../../lib/readableDate');
  var debug = require('debug')(APP_NAME.concat(':supportConvo.model'));
  var Message = require('../message/message.model').model;
  var welcomeMessage = require('../../config/environment').welcome_message;

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
   * @type {{createdAt: {type: Date, default: Function}, owner: {type: (Types.ObjectId|*|p.ObjectId|.exports.ObjectId|exports.ObjectId|ObjectId), ref: string}, messages: {type: (Types.ObjectId|*|p.ObjectId|.exports.ObjectId|exports.ObjectId|ObjectId), ref: string}[]}}
   */
  var schemaPaths = {
    createdAt: {
      type: Date,
      default: Date.now
    },
    owner: {
      type: ObjectId,
      ref: 'User'
    },
    messages: [{
      type: ObjectId,
      ref: 'Message'
    }]
  };

  var schema = mongoose.Schema(schemaPaths, schemaOps);

  schema.plugin(captainHook);
  schema.plugin(deepPopulate, {
    populate: {
      'messages.owner': {
        select: 'firstName lastName'
      }
    }
  });
  schema.plugin(lastMod);
  schema.plugin(readableDate);

  // Send welcome message.
  schema.preCreate(function(supportConvo, next) {
    if (supportConvo.messages.length === 0) {
      var msg = new Message({
        content: welcomeMessage
      });
      msg.save(function(err, savedMsg) {
        if (err) {
          next(err);
          return;
        } else if (savedMsg) {
          supportConvo.messages.push(savedMsg);
          next();
        }
      });
    }
  });

  /**
   * Returns schema and model for easy reference in the future.
   * @type {{model: *, schema: *}}
   */
  module.exports = exports = {
    model: db.model('SupportConvo', schema),
    schema: schema
  };

}());
