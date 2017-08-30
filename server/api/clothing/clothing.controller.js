(function() {
  'use strict';

  var _             = require('lodash');
  var fs            = require('fs');
  var async         = require('async');
  var knox          = require('knox');
  var mongoose      = require('mongoose');
  var Clothing      = require('./clothing.model.js').model;
  var ClothingType  = require('./clothingType.model').model;
  var Armoire       = require('../armoire/armoire.model').model;
  var Image         = require('../image/image.model').model;
  var ImageUploader = require('../../lib/imageUploader');
  var debug         = require('debug')(APP_NAME.concat(':clothingItem.controller'));
  var aws           = require('../../lib/aws');

  var config = require('../../config/environment');

  var controller = {};

  /**
   * Find ClothingItem by ID
   * @param req
   * @param res
   * @param next
   * @param id
   */
  controller.clothing = function(req, res, next, id) {
    Clothing.findById(id, function(err, item) {
      if (err) {
        next(err);
      } else if (item) {
        req.clothing = item;
        next();
      } else {
        next(new Error('failed to load ClothingItem'));
      }
    });
  };

  /**
   * Returns delivery based on id.
   * @see module.exports.show
   * @param req
   * @param res
   * @param next
   */
  controller.show = function (req, res, next) {
    res.send(req.clothing);
  };



  /**
   * Returns all clothing items, sorted by creation date.
   * @param req
   * @param res
   * @param next
   */
  controller.index = function(req, res, next){
    var queryTerm = new RegExp(req.query.q, 'i');

    Clothing.find({})
      .sort('createdAt')
      .exec(function (err, users) {
        if (err) {
          next(err);
        } else if (users) {
          res.send(users);
        } else {
          next(new Error('failed to load clothing items'));
        }
      });
  };



  /**
   *
   * @param req
   * @param res
   * @param next
   */
  controller.create = function(req, res, next){
    if(!req.armoire && !req.body.armoire){
      return next(new Error('Unknown armoire'));
    }

    if(!req.body.img){
      return next(new Error('No image'));
    }

    var filename = req.body.img.name;
    var ext = filename.split('.').pop();
    var url = abs_path('uploads/images/') + filename;
    var originalBuffer = new Buffer(req.body.img.uri, "base64");
    var cleanBuffer = new Buffer(req.body.img.uri.replace(/^data:image\/(png|gif|jpeg);base64,/,''), "base64");

    async.waterfall([
      function saveToDisk(done){
        fs.writeFile(url, cleanBuffer, function(err) {
          if(err) {
            debug('ERROR', err);
            return;
          } else {
            done(err);
          }
        });
      },
      function createNewImage(done){
        var img = new Image();
        img.save(function(err, savedImg){
          if(err){
            next(err);
            return;
          }
          done(err, savedImg);
        });
      },
      function resize(savedImg, done){
        var uploader = new ImageUploader();
        uploader.process( savedImg.id, url, function(err, sizedImages) {
          if (err) {
            savedImg.remove();
            debug(err);
            next(err);
            return;
          }
          debug(sizedImages);
          done(err, savedImg, sizedImages);
        });
      },
      function updateImage(savedImg, sizedImages, done){
        _.merge(savedImg, sizedImages);
        savedImg.save(function(err, updatedImg){
          if(err){
            next(err);
            return;
          }
          done(err, updatedImg);
        });
      },
      function saveClothing(updatedImg, done){
        var clothing = new Clothing(req.body);
        clothing.image = updatedImg.id;
        clothing.save(function(err, savedClothing){
          if(err){
            next(err);
            return;
          }
          Clothing.populate(savedClothing,  { path: 'image'}, function(err, savedClothing){
            done(err, savedClothing);
          });
        });
      },
      function updateArmoire(savedClothing, done){
        Armoire.findByIdAndUpdate(savedClothing.armoire, {$push: {'items': savedClothing}}, function(err, savedArmoire){
          if(err){
            next(err);
            return;
          }
          done(err, savedClothing);
        });
      },
      function success(clothingItem){
        res.send(clothingItem);
        // Cleanup
        fs.unlinkSync(url);
        return;
      }
    ]);
  };

  /**
   * fetchers user, from param, then adds all clothing items from each of their armoires.
   * @param res
   * @param res
   * @param next
   */
  controller.byUser = function(req, res, next){
    var clothingItems = [];
    _.each(req.fetchedUser.armoires, function(armoire){
      clothingItems = clothingItems.concat(armoire.items);
    });
    res.send(clothingItems);
  };



  /**
   * Reads user.seed.json and seeds database off that.
   **/
  controller.seed = function(){
    debug('seed::START');
    var seedFile = require('./clothing.seed.json');
    //debug(seedFile);
    ///*
    _.forEach(seedFile.clothingTypes, function(seed){
      debug('checking ' + seed.title);

      //ClothingType.find({ title: seed.title }, function(err, ct){
      //  if(!ct){
          var newSeed = new ClothingType(seed);
          newSeed.save(function(err, seeded){
            if(seeded){
              debug("Created " + seeded.title);
            }
          });
        //}
      //});
    });
    debug('seed::STOP');
    //*/
  };

  module.exports = controller;
}());
