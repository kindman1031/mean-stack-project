module.exports = function (app) {
  var bodyParser = require('body-parser');

  app.use(bodyParser.json({limit: '20mb'}));
  app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
  app.get('debug:log')('config/body-parsing ran successfully');
};
