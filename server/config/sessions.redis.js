module.exports = function (app, config) {
  var session = require('express-session');
  var redisUrl = require('redis-url');
  var RedisStore = require('connect-redis')(session);
  var redisClient = redisUrl.connect(process.env.REDISTOGO_URL);
  var redisClientDebug = require('debug')('redis-client');

  redisClient.once('connect', function () {
    redisClientDebug('connected!');
  });
  redisClient.once('ready', function () {
    redisClientDebug('now ready!');
  });

  app.use(session({
    store: new RedisStore({
      client: redisClient
    }),
    secret: process.env.REDIS_SESSION_SECRET,
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  }));
  app.get('debug:log')('config/session-redis ran successfully');
};
