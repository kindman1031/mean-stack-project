(function() {
  'use strict';

  var mongoose = require('mongoose');
  var db = require('../../db');
  var lastMod = require('../../lib/lastMod');
  var readableDate = require('../../lib/readableDate');
  var debug = require('debug')(APP_NAME.concat(':image.model'));

  var schema = mongoose.Schema({
    createdAt: {
      type: Date,
      'default': Date.now
    },
    thumbnail: {
      type: String
    },
    large: {
      type: String
    },
    origin: {
      type: String
    }
  });

  schema.plugin(lastMod);
  schema.plugin(readableDate);

  module.exports = exports = {
    model: db.model('Image', schema),
    schema: schema
  };

}());
