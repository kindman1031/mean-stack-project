var debug = require('debug')('readableDate');
var moment = require('moment');
var config = require('../config/environment');
var _ = require('lodash');

module.exports = exports = function readableDatePlugin (schema, options) {
  options = options || {};

  schema.eachPath(function(path){
    //debug(path);
    //debug(schema.path(path));
    if(schema.path(path).options.type === Date){
      var readablePath = path + 'Readable';
      if(options.debug){
        debug(path, 'Found path that is Date, adding virtual for readable.', readablePath);
      }
      schema.virtual(readablePath).get(function(){
        if(options.debug){
          debug(readablePath, this[path]);
        }

        if(_.isDate(this[path])){
          return moment(this[path]).format(config.momentJS.format)
        }
        return undefined;
      });
    }
  });
  if(options.debug)
    debug('ran successfully on ' + schema);
};
