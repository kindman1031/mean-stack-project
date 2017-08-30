module.exports = function (app, config) {
  var path = require('path');
  app.get('debug:log')(path.resolve(__dirname, '../views'));
  app.set('views', path.resolve(__dirname, '../views'));
  app.set('view engine', 'ejs');
  app.get('debug:log')('config/view ran successfully');
};
