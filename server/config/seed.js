module.exports = function(connection){
  var debug = require('debug')('config/seed');
  require('../api/user/user.controller').seed();
  require('../api/armoire/armoire.controller').seed();
  require('../api/clothing/clothing.controller').seed();
  debug('Seeding complete');
};
