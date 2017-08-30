/**
 * Main application routes
 */

var path = require('path');

'use strict';
module.exports = function(app, config, connection) {
  // Middleware on every call
  function middle (req, res, next) {
    return next();
  }

  app.use(middle);

  app.use('/api/auth', require('./api/auth'));
  app.use('/api/armoire', require('./api/armoire'));
  app.use('/api/clothing', require('./api/clothing'));
  app.use('/api/contact', require('./api/contact'));
  app.use('/api/delivery', require('./api/delivery'));
  app.use('/api/image', require('./api/image'));
  app.use('/api/pricing', require('./api/pricing'));
  app.use('/api/user', require('./api/user'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(auth|components|app|bower_components|assets)/*')
    .get(function(req, res){
      res.redirect('/404');
    });

  // All undefined api routes should return a 404, but just a simple status
  app.route('/:url(api)/*')
    .get(function(req, res){
      res.status(404).send();
    });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      //res.send('changed app route');
      //res.render(app.get('appPath') + '/index', { config: config});
      //res.send('index', {config: config});

      if(config.serve_dist){
        res.sendfile(path.resolve(__dirname, '../dist/') + '/index.html');
      } else {
        res.sendfile(path.resolve(__dirname, '../client') + '/index.html');
      }
    });

  return app;
};
