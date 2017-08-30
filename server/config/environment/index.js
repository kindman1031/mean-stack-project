(function() {
  'use strict';

  var path = require('path');
  var _ = require('lodash');

  function requiredProcessEnv(name) {
    if (!process.env[name]) {
      throw new Error('You must set the ' + name + ' environment variable');
    }
    return process.env[name];
  }

  // All configurations will extend these options
  // ============================================
  var all = {
    debug: process.env.DEBUG || '*',
    env: process.env.NODE_ENV || 'development',
    domain: process.env.DOMAIN || 'localhost',

    // Root path of server
    root: path.normalize(__dirname + '/../../..'),

    // Server port
    port: process.env.PORT || 8080,

    // Secret for session, you will want to change this and make it an environment variable
    secrets: {
      session: 'armoire-app-82-secret'
    },

    // MomentJS default formatting
    momentJS: {
      format: 'MMM Do, YYYY [@] h:mma'
    },

    // MongoDB connection options
    mongo: {
      options: {
        db: {
          safe: true
        }
      }
    },

    serve_dist: process.env.SERVE_DIST || false,

    mailgun: {
      api_key: process.env.MAILGUN_API_KEY || 'key-dc29777c935babbde0e96cfbe1e900d5',
      domain: process.env.MAILGUN_DOMAIN || 'mg.getmyarmoire.com',
      sender: process.env.MAILGUN_SENDER || 'app@getmyarmoire.com',
      smtp_login: process.env.MAILGUN_SMTP_LOGIN || 'postmaster@mg.getmyarmoire.com',
      smtp_password: process.env.MAILGUN_SMTP_PASSWORD || 'e76b1219aaba9c8e9e747c13e46b14da',
      smtp_port: process.env.MAILGUN_SMTP_PORT || '587',
      smtp_server: process.env.MAILGUN_SMTP_SERVER || 'MAILGUN_SMTP_SERVER'
    },

    // Mail recipients
    mailRecipients: {
      delivery: process.env.MAIL_RECIPIENT_DELIVERY || '',
      support: process.env.MAIL_RECIPIENT_SUPPORT || '',
    },

    s3: {
      key: process.env.AWS_API_KEY || "AKIAIN6OUBLH5ZVLO4MA",
      secret: process.env.AWS_API_SECRET || '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',
      bucket: process.env.AWS_API_BUCKET || 'armoire-app-stage'
    },

    // Stripe
    stripe: {
      publishing_key: process.env.STRIPE_PUBLISHING_KEY || 'pk_test_dYkb6TR4aHMcX3YnqcprKokB',
      secret: process.env.STRIPE_SECRET_KEY || 'sk_test_kabFt3L87z6SY4eLkVNnH2La',
      packagePrefix: process.env.STRIPE_PACKAGE_PREFIX || ''
    },

    // Admin users
    // This is a comma separated list of emails
    admin_users: process.env.ADMIN_USERS || '',

    // Welcome message to user.
    welcome_message: '<strong>Welcome!</strong><br/>' +
      '<p>Thank you for joining Armoire. Please be sure to fill out your profile, as we need to know your address and billing information before you can order an armoire.</p>'
  };

  // Export the config object based on the NODE_ENV
  // ==============================================
  module.exports = _.merge(
    all,
    require('./' + all.env + '.js') || {});

}());
