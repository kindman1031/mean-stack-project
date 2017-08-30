var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var captainHook = require('captain-hook');
var deepPopulate = require('mongoose-deep-populate');
var debug = require('debug')(APP_NAME.concat(':message.model'));
var db = require('../../db');
var lastMod = require('../../lib/lastMod');
var readableDate = require('../../lib/readableDate');

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
  createdAt: {
    type: Date,
    'default': Date.now
  },
  owner: {
    type: ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  }
}, schemaOps);

schema.plugin(captainHook);
schema.plugin(deepPopulate, {
  populate: {
    'messages.user': {
      select: 'firstName lastName'
    }
  }
});
schema.plugin(lastMod);
schema.plugin(readableDate);


schema.preUpdate(function(message, next) {

});

schema.pre('save', function(next) {
  var message = this;
  User = require('../user/user.model').model;

  if (!message.owner) {
    message.owner = User.getAdminId();
    next();
  }
  next();
});

module.exports = exports = {
  model: db.model('Message', schema),
  schema: schema
};
