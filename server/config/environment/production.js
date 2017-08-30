(function() {
  'use strict';

  // Production specific configuration
  // =================================
  module.exports = {
    // Server IP
    ip: process.env.IP || undefined,

    domain: process.env.DOMAIN || "app.getmyarmoire.com",

    // Server port
    port: process.env.PORT || 8080,

    // Amazon AWS
    aws_key: process.env.AWS_API_KEY || "AKIAIZSXNTDRWGKAD4NA",

    // Facebook
    facebook: {
      app_id: process.env.FB_APP_ID || "745165335576892",
      app_secret: process.env.FB_APP_SECRET || "17fa058b2975e27405fdd30d8be9c152",
      app_callback: process.env.FB_APP_CALLBACK || "http://app.getmyarmoire.com/auth/facebook/callback"
    },

    // HTTP COOKIES
    cookie_name: process.env.COOKIE_NAME || "armoire-app-prod",

    // Mailgun
    mailgun: {
      api_key: process.env.MAILGUN_API_KEY || 'key-dc29777c935babbde0e96cfbe1e900d5',
      domain: process.env.MAILGUN_DOMAIN || 'mg.getmyarmoire.com',
      sender: process.env.MAILGUN_SENDER || 'app@getmyarmoire.com',
      smtp_login: process.env.MAILGUN_SMTP_LOGIN || 'postmaster@mg.getmyarmoire.com',
      smtp_password: process.env.MAILGUN_SMTP_PASSWORD || 'e76b1219aaba9c8e9e747c13e46b14da',
      smtp_port: process.env.MAILGUN_SMTP_PORT || '587',
      smtp_server: process.env.MAILGUN_SMTP_SERVER || 'MAILGUN_SMTP_SERVER'
    },

    // MongoDB connection options
    mongo: {
      uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/armoiremarketingsite'
    },

    // Raygun debugging connection
    raygun_api_key: process.env.RAYGUN_API_KEY || "9GGkxHh43kgbb2zWX42/2g==",

    secrets: {
      session: process.env.SECRET_SESSION || 'armoire-app-prod'
    },

    // Seed Database
    seedDB: process.env.SEED_DB == 'true' || false,

    serve_dist: true
  };

}());
