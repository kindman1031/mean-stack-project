module.exports = function (app, config) {
  //var logger = require('morgan');
  //app.use(require('morgan')('dev'));
  app.get('debug:log')('config/logging ran successfully');
};
