module.exports = function (app, config) {
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development' || process.platform === 'darwin') {
    console.log('Using development error reporting because in dev mode or on mac.');
    app.use(function (err, req, res, next) {
      var status = err.status || 500;
      var errObj = {
        status: status,
        message: err.message,
        error: err
      };

      res.status(status);

      if (req.accepts('json')) {
        res.send(errObj);
      } else {
        res.render('error', errObj);
      }
    });
  } else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
      var status = err.status || 500;
      var errObj = {
        status: status,
        message: err.message,
        error: {}
      };

      res.status(status);

      if (req.accepts('json')) {
        res.send(errObj);
      } else {
        res.render('error', errObj);
      }
    });
  }
  app.get('debug:log')('config/routes-error-handling ran successfully');
};
