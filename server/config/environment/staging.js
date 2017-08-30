(function() {
  'use strict';

  // Production specific configuration
  // =================================
  module.exports = {
    // Server IP
    ip: process.env.IP || undefined,

    domain: process.env.DOMAIN || "staging.getmyarmoire.com",

    // Server port
    port: process.env.PORT || 8080,

    // Amazon AWS
    aws_key: process.env.AWS_API_KEY || "AKIAIZSXNTDRWGKAD4NA",

    // Facebook
    facebook: {
      app_id: process.env.FB_APP_ID || "745165335576892",
      app_secret: process.env.FB_APP_SECRET || "17fa058b2975e27405fdd30d8be9c152",
      app_callback: process.env.FB_APP_CALLBACK || "http://staging.getmyarmoire.com/auth/facebook/callback"
    },

    // HTTP COOKIES
    cookie_name: process.env.COOKIE_NAME || "armoire-app-staging",

    // Mailgun
    mailgun: {
      api_key: process.env.MAILGUN_API_KEY || 'key-761d83fb7b5d4b128f4cf005e94cf7f8',
      domain: process.env.MAILGUN_DOMAIN || 'app106f83898a4c49f4a5fcb41f4821e09a.mailgun.org',
      sender: process.env.MAILGUN_SENDER || 'staging@getmyarmoire.com',
      smtp_login: process.env.MAILGUN_SMTP_LOGIN || 'postmaster@app106f83898a4c49f4a5fcb41f4821e09a.mailgun.org',
      smtp_password: process.env.MAILGUN_SMTP_PASSWORD || 'ee1fde3faf9637cb8467931c0f2c3758',
      smtp_port: process.env.MAILGUN_SMTP_PORT || '587',
      smtp_server: process.env.MAILGUN_SMTP_SERVER || 'MAILGUN_SMTP_SERVER'
    },

    // MongoDB connection options
    mongo: {
      uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://heroku_app35162346:4hc86h56g5r2c1543vivaktjal@ds045031.mongolab.com:45031/heroku_app35162346'
    },

    // Raygun debugging connection
    raygun_api_key: process.env.RAYGUN_API_KEY || "cQ1M+Bp4edIpCmkB8swNsw==",

    // Stripe
    stripe: {
      packagePrefix: process.env.STRIPE_PACKAGE_PREFIX || 'stage-'
    },

    secrets: {
      session: process.env.SECRET_SESSION || 'armoire-app-staging-assdasasd'
    },

    serve_dist: true
  };

}());
