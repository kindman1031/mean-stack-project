module.exports.config         = require('./server/config/environment');
module.exports.debug          = require('debug')('armoire-app');
module.exports.utils          = require('./server/utils.js');
module.exports.accessLevels   = require('./client/javascripts/routingConfig').accessLevels;
module.exports.userRoles      = require('./client/javascripts/routingConfig').userRoles;
module.exports.db             = require('./server/db.js');
module.exports.lib            = require('./server/lib');

// 3rd party
module.exports.Promise        = require('bluebird');

// lodash
module.exports._              = require('lodash');

module.exports.debug('test');
