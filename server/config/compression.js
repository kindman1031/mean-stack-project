module.exports = function (app, config) {
  var compression = require('compression');
  app.use(compression());
  app.get('debug:log')('config/compression ran successfully');
};
