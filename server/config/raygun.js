module.exports = function (app, config) {
  var raygun = require('raygun');
  var raygunClient = new raygun.Client().init({ apiKey: config.raygun_api_key });

  raygunClient.user = function (req) {
    if (req.user) {
      return req.user.local.email;
    }
  };
  //raygunClient.setVersion();

// For express, at the end of the middleware definitions:
  app.use(raygunClient.expressHandler);

  app.get('debug:log')('config/raygun ran successfully');
};
