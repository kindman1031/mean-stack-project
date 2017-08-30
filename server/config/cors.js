module.exports = function (app) {
  var cors = require('cors');
  app.use(cors());
  app.get('debug:log')('config/cors ran successfully');
};
