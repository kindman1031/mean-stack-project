module.exports = function(app, config){
  var livereload = require('express-livereload')(app, config.livereload)
  return livereload;
};
