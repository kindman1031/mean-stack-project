(function() {
  'use strict';

  var _ = require('lodash');
  var Image = require('./image.model').model;
  var debug = require('debug')(APP_NAME.concat(':image.controller'));

  /**
   * Find Image by ID
   * @param req
   * @param res
   * @param next
   */
  module.exports.image = function(req, res, next, id) {
    Image.findById(id, function(err, item) {
      if (err) {
        next(err);
      } else if (item) {
        req.image = item;
        next();
      } else {
        next(new Error('failed to load Image'));
      }
    });
  };

  /**
   * Returns all Images, sorted by creation date.
   * @param req
   * @param res
   * @param next
   */
  module.exports.index = function(req, res, next) {
    var queryTerm = new RegExp(req.query.q, 'i');

    Image.find({})
      .sort('createdAt')
      .exec(function(err, items) {
        if (err) {
          next(err);
        } else if (items) {
          res.send(items);
        } else {
          next(new Error('failed to load Images'));
        }
      });
  };

  /**
   * Returns Image based on id.
   * @see module.exports.image
   * @param req
   * @param res
   * @param next
   */
  module.exports.show = function(req, res, next) {
    res.send(req.image);
  };

  /**
   * Creates a new Image.
   * @param req
   * @param res
   * @param next
   */
  module.exports.create = function(req, res, next) {
    var newItem = new Image(req.body);

    newItem.save(function(err, item) {
      if (err) {
        return next(err);
      }
      res.send(item);
    });
  };

  /**
   * Remove Image.
   * @param res
   * @param req
   * @param next
   */
  module.exports.destroy = function(res, req, next) {
    var item = req.image;
    item.enabled = false;
    item.save(function(err) {
      if (err) return next(err);

      res.send(item);
    });
  };


  /**
   * Update Image.
   * @param req
   * @param res
   * @param next
   */
  module.exports.update = function(req, res, next) {
    var item = req.image;
    item = _.extend(item, req.body);
    item.save(function(err) {
      if (err) return next(err);

      res.send(item);
    });
  };

}());
