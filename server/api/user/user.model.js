(function() {
  'use strict';

  var config = require('../../config/environment');

  var _ = require('lodash');
  var bcrypt = require('bcrypt');
  var SALT_WORK_FACTOR = 10;
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  var ObjectId = Schema.Types.ObjectId;
  var common = require('../../../common');
  var stripe = common.lib.stripe;
  var empty = common.lib.utils.empty;
  var db = require('../../db');
  var routingConfig = require('../../../client/javascripts/routingConfig');
  var userRoles = routingConfig.userRoles;
  var roles = routingConfig.config.roles;
  var accessLevels = routingConfig.config.accessLevels;
  var debug = require('debug')('user.model');
  var Armoire = require('../armoire/armoire.model').model;
  var Message = require('../message/message.model').model;
  var SupportConvo = require('../supportConvo/supportConvo.model').model;

  // Model Plugins
  var captainHook = require('captain-hook');
  var deepPopulate = require('mongoose-deep-populate');
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

  /**
   * Schema paths.
   * @type {{enabled: {type: Function, default: boolean}, role: {bitMask: {type: Function}, title: {type: Function}}, createdAt: {type: Date, default: Function}, modifiedAt: {type: Date, default: Function}, activated: {type: Function, default: boolean}, activatedToken: {type: Function}, activatedAt: {type: Date, default: Function}, resetPasswordToken: Function, resetPasswordExpires: Date, loginAt: {type: Date}, lastUri: {type: Function}, phone: {type: Function}, local: {email: {type: Function, unique: boolean}, password: {type: Function}}, facebookId: {type: Function}, facebookData: {token: {type: Function}, email: {type: Function}, name: {type: Function}}, twitterId: {type: Function}, twitterData: {token: {type: Function}, displayName: {type: Function}, username: {type: Function}}, googleId: {type: Function}, googleData: {token: {type: Function}, email: {type: Function}, name: {type: Function}}, firstName: {type: Function, required: boolean}, lastName: {type: Function, required: boolean}, address: {street_1: {type: Function}, street_2: {type: Function}, city: {type: Function}, state: {type: Function}, country: {type: Function}, zip: {type: Function}}, armoires: {type: (Types.ObjectId|*|p.ObjectId|.exports.ObjectId|exports.ObjectId|ObjectId), ref: string}[], deliveries: {type: (Types.ObjectId|*|p.ObjectId|.exports.ObjectId|exports.ObjectId|ObjectId), ref: string}[], supportConvo: {type: (Types.ObjectId|*|p.ObjectId|.exports.ObjectId|exports.ObjectId|ObjectId), ref: string}, stripeId: {type: Function}, stripeCard: {type: Function}, seeded: {type: Function, default: boolean}}}
   */
  var schemaPaths = {
    enabled: {
      type: Boolean,
      default: true
    },
    profileCompletedAlertShown: {
      type: Boolean,
      default: false
    },
    role: {
      bitMask: {
        type: Number
      },
      title: {
        type: String
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    },
    activated: {
      type: Boolean,
      default: true
    },
    activatedToken: {
      type: String
    },
    activatedAt: {
      type: Date,
      default: Date.now
    },
    // Reset token
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    loginAt: {
      type: Date
    },
    lastUri: {
      type: String
    },
    phone: {
      type: String
    },
    // Local
    local: {
      email: {
        type: String,
        unique: true
      },
      password: {
        type: String
      }
    },
    // Reset token
    // Facebook
    facebookId: {
      type: String
    },
    facebookData: {
      token: {
        type: String
      },
      email: {
        type: String
      },
      name: {
        type: String
      }
    },
    // Twitter
    twitterId: {
      type: String
    },
    twitterData: {
      token: {
        type: String
      },
      displayName: {
        type: String
      },
      username: {
        type: String
      }
    },
    // Google
    googleId: {
      type: String
    },
    googleData: {
      token: {
        type: String
      },
      email: {
        type: String
      },
      name: {
        type: String
      }
    },
    // Generic
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image'
    },
    address: {
      street_1: {
        type: String
      },
      street_2: {
        type: String
      },
      city: {
        type: String
      },
      state: {
        type: String
      },
      country: {
        type: String
      },
      zip: {
        type: String
      }
    },
    armoires: [{
      type: ObjectId,
      ref: 'Armoire'
    }],
    supportConvo: {
      type: ObjectId,
      ref: 'SupportConvo'
    },
    stripeId: {
      type: String
    },
    stripeCard: {
      type: String
    },
    seeded: {
      type: Boolean,
      default: false
    }
  };

  var schema = mongoose.Schema(schemaPaths, schemaOps);

  schema.plugin(captainHook);
  schema.plugin(deepPopulate);
  schema.plugin(lastMod);
  schema.plugin(readableDate);

  schema.pre('save', function(next) {
    var user = this;

    if (user.local.email) {
      user.local.email = user.local.email.toLowerCase();

      if (user.isEmailAdmin(user.local.email)) {
        user.role = userRoles.admin;
      } else {
        user.role = userRoles.user;
      }
    }

    if (user.isModified('local.password') || user.isNew) {
      user.local.password = user.generateHash(user.local.password);
    }

    next();
  });

  // Setup SupportConvo
  schema.preCreate(function(user, next) {
    if (empty(user.supportConvo)) {
      var sc = new SupportConvo({
        owner: user.id
      });
      sc.save(function(err, savedSc) {
        if (err) {
          next(err);
          return;
        } else if (savedSc) {
          user.supportConvo = savedSc.id;
          next();
        }
      });
    }
  });

  schema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(SALT_WORK_FACTOR), null);
  };

  schema.methods.hashPassword = function(password) {
    var user = this;

    // hash the password
    bcrypt.hash(password, null, null, function(err, hash) {
      if (err)
        return next(err);

      user.local.password = hash;
    });
  };

  // Allows us to set it, but without persisting into DB.
  schema.virtual('deliveries').get(function() {
    return this._deliveries || [];
  }).set(function(deliveries) {
    this._deliveries = deliveries;
  });

  schema.virtual('addressReadable').get(function() {
    // {{ d.customer.address.street_1 }} {{ d.customer.address.street_2 }}, {{ d.customer.address.city }}, {{ d.customer.address.state }}, {{ d.customer.address.country }}
    return ''.concat(
      this.address.street_1 + ' ' + this.address.street_2 + ', ',
      this.address.city + ' ' + this.address.state + ' ' + this.address.zip + ', ',
      this.address.country
    );
  });

  // checking if password is valid
  schema.methods.validPassword = function(password) {
    var user = this.populate('+local.password');
    //user.select(this, "+local.password", function(err, user){
    debug('validPassword('.concat(password, ')', user.local));
    return bcrypt.compareSync(password, user.local.password);
    //});
  };

  schema.static('getAdminId', function() {
    if (User.getAdmin()) {
      return User.getAdmin().id;
    }
    return undefined;
  });

  schema.static('getAdmin', function() {
    User.findOne({
      'local.email': User.getAdminEmail()
    }, function(err, user) {
      if (err) {
        return false;
      } else if (user) {
        return user;
      }
      return false;
    });
  });

  schema.static('getAdminEmail', function() {
    return User.getAdminEmails()[0];
  });

  schema.static('getAdminEmails', function() {
    // get admin emails from config
    var adminEmails = config.admin_users.replace(/ +?/g, '');
    return adminEmails.split(',');
  });

  schema.methods.isEmailAdmin = function(email) {
    var user = this;
    email = email || user.local.email;
    return _.indexOf(User.getAdminEmails(), email.toLowerCase()) > -1;
  };

  schema.methods.updateStripeCard = function() {
    var user = this;
    stripe.customers.retrieve(this.stripeId).then(
      function(su) {
        if (_.has(su, 'default_card')) {
          user.stripeCard = su['default_card'];
          user.save();
        }
      },
      function(err) {
        // No default card. Not saving
      }
    );
  };

  schema.virtual('supportRoom').get(function() {
    var user = this;
    return 'support-'.concat(user.id);
  });

  schema.virtual('isProfileComplete').get(function() {
    var user = this;
    var rtn = true;

    // Phone
    rtn = empty(user.phone) ? false : rtn;

    // Address
    if (!empty(user.address)) {
      rtn = empty(user.address.street_1) ? false : rtn;
      rtn = empty(user.address.state) ? false : rtn;
      rtn = empty(user.address.city) ? false : rtn;
      rtn = empty(user.address.state) ? false : rtn;
      rtn = empty(user.address.zip) ? false : rtn;
      rtn = empty(user.address.country) ? false : rtn;
    } else {
      rtn = false;
    }
    rtn = empty(user.stripeCard) ? false : rtn;

    return rtn;
  });

  schema.virtual('homePath').get(function() {
    var user = this;
    if (!user.isProfileComplete) {
      return '/profile';
    }

    switch (user.role.title) {
      case 'admin':
        {
          return '/admin';
        }
      default:
        {
          return '/customer';
        }
    }
  });

  schema.virtual('isBillable').get(function() {
    var user = this;
    //return _.has(user, 'stripeId') && _.has(user, 'stripeCard');
    return !empty(user.stripeId) && !empty(user.stripeCard);
  });

  schema.virtual('hasPassword').get(function() {
    var user = this;
    return user.local.password !== null;
  });

  schema.virtual('isAdmin').get(function() {
    var user = this;
    return user.role.title == "admin";
  });

  schema.virtual('totalItems').get(function() {
    //var armoires = this.armoires;
    var t = 0;
    _.each(this.armoires, function(armoireId) {
      Armoire.findById(armoireId, function(err, armoire) {
        if (armoire) {
          t += armoire.items.length;
        }
      });
    });
    return t;
  });

  var User = db.model('User', schema);

  module.exports = exports = {
    model: User,
    schema: schema
  };

}());
