(function() {
  'use strict';

  var  _ = require('lodash');
  var SupportConvo = require('./supportConvo.model').model;
  var Message = require('../message/message.model').model;
  var debug = require('debug')(APP_NAME.concat(':supportConvo.controller'));

  module.exports.byUser = function(req, res, next){
    if(req.fetchedUser){
      SupportConvo.findOne({owner:req.fetchedUser.id})
        .deepPopulate('messages messages.owner')
        .exec(function(err, supportConvo){
          if(err){
            next(err);
          } else if (supportConvo){
            res.send(supportConvo);
          }
        });
    } else {
      next(new Error('req.fetchedUser not defined!'));
    }
  };

}());
