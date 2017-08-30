(function() {
  'use strict';

  var path = require('path');

  // Development specific configuration
  // ==================================
  module.exports = {
    domain: 'local.armoire.com:8080',

    // Amazon AWS
    aws_key: "AKIAIZSXNTDRWGKAD4NA",

    // FACEBOOK
    facebook: {
      app_id: "745165335576892",
      app_secret: "17fa058b2975e27405fdd30d8be9c152",
      app_callback: "http://localhost:3000/auth/facebook/callback"
    },

    // HTTP COOKIES
    cookie_name: "armoire-app-dev",

    // Livereload
    livereload: {
      watchDir: path.normalize(__dirname + '/../../../client/css'),
      ignore: ['.js', '.svg']
    },

    // Mailgun connection options
    mailgun: {
      api_key: 'key-4439bc376c1b10e151a4dd585b2619ec',
      domain: 'app6e329426cb2d453d8ded604624f299da.mailgun.org'
    },

    // Mail recipients
    mailRecipients: {
      delivery: 'felipe.diep+delivery@gmail.com',
      support: 'felipe.diep+support@gmail.com'
    },

    // MongoDB connection options
    mongo: {
      uri: 'mongodb://localhost/armoireapp-dev'
    },

    // Raygun
    raygun_api_key: "rW0i4jyKWENHS7bIF0puBQ==",

    // Stripe
    stripe: {
      packagePrefix: process.env.STRIPE_PACKAGE_PREFIX || 'development-'
    },

    secrets: {
      session: 'armoire-app-dev'
    },

    // Admin users
    // This is a comma separated list of emails
    admin_users: 'felipe.diep@gmail.com, phillip@gmail.com',

    // Seed Database
    seedDB: false
  };

}());
