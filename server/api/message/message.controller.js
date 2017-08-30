var  _            = require('lodash');
var Message       = require('./message.model').model;
var debug = require('debug')(APP_NAME.concat(':message.controller'));


/**
 * Find Message by ID
 * @param req
 * @param res
 * @param next
 * @param id
 */
module.exports.message = function(req, res, next, id) {
  Message.findById(id, function(err, item) {
    if (err) {
      next(err);
    } else if (item) {
      req.supportConvo = item;
      next();
    } else {
      next(new Error('failed to load Message'));
    }
  });
};

/**
 * Returns all Messages, sorted by creation date.
 * @param req
 * @param res
 * @param next
 */
module.exports.index = function(req, res, next){
  var queryTerm = new RegExp(req.query.q, 'i');

  Message.find({})
    .sort('createdAt')
    .exec(function (err, items) {
      if (err) {
        next(err);
      } else if (items) {
        res.send(items);
      } else {
        next(new Error('failed to load Messages'));
      }
    });
};

/**
 * Returns Message based on id.
 * @param req
 * @param res
 * @param next
 */
module.exports.show = function(req, res, next){
  res.send(req.message);
};

/**
 * Creates a new Message.
 * @param req
 * @param res
 * @param next
 */
module.exports.create = function(req, res, next){
  var newItem = new Message(req.body);

  newItem.save(function(err, savedItem){
    if(err){
      return next(err);
    } else if (savedItem){
      res.send(savedItem);
    }
  });
};

/**
 * Remove Message.
 * @param res
 * @param req
 * @param next
 */
module.exports.destroy = function(res, req, next){
  var item = req.armoire;
  item.enabled = false;
  item.save(function (err) {
    if (err) return next(err);

    res.send(item);
  });
};


/**
 * Update Message.
 * @param req
 * @param res
 * @param next
 */
module.exports.update = function(req, res, next){
  var item = req.message;
  item = _.extend(item, req.body);
  item.save(function (err) {
    if (err) return next(err);

    res.send(item);
  });
};

/**
 * Gets Message(s) for a user. Should only be called if User is defined in req object.
 * @param req
 * @param res
 * @param next
 */
module.exports.byUser = function(req, res, next){
  if(req.fetchedUser){
    Message.find({
      $or:[ {'sentTo':req.fetchedUser.id}, {'postedBy': req.fetchedUser.id}]
    }, function(err, messages){
      if(err){
        next(err)
      } else if(messages) {
        res.send(messages);
      } else {
        next(new Error('failed to load Message(s)'));
      };
    });
  } else {
    next(new Error('User not defined! Failed to load Message(s).'));
  }
};
