var debug = require('debug')('lastMod');

module.exports = exports = function lastModifiedPlugin (schema, options) {
  options = options || {};

  schema.add({ modifiedAt: Date })

  schema.pre('save', function (next) {
    this.modifiedAt = new Date;
    next();
  });

  if (options && options.index) {
    schema.path('modifiedAt').index(options.index)
  }
  debug('ran successfully on ' + schema);
};
