var session = require('express-session')
  , flash = require('connect-flash');

module.exports = function (app, config) {
  app.use(flash());

  app.use(session({
    secret: "bananaBone",
    cookie: {
      maxAge: 1000 * 60 * 60
    },
    saveUninitialized : true,
    resave : true
  }));
  app.get('debug:log')('config/session ran successfully');
};
