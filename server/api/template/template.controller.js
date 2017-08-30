/*
 * Templates: simple templating engine based on handelbarsjs
 */
(function() {
  'use strict';

  var handlebars = require('handlebars');
  var layouts = require('handlebars-layouts');
  var moment = require('moment');
  var fs = require('fs');
  var debug = require('debug')(APP_NAME.concat(':template.controller'));

  var controller = {};
  var templatesUrl = abs_path('server/api/template/');

  controller.compile = function(layoutPath, layoutData) {
    // make layoutPath a valid path string
    layoutPath = layoutPath.replace(/\./g, '/');
    // add extension and make fullPath
    var fullPath = templatesUrl + layoutPath + '.html';
    debug('find template in: ', fullPath);
    // Compile template
    var template = handlebars.compile(fs.readFileSync(fullPath, 'utf8'));
    // Render template
    return template(layoutData);
  };

  controller.registerPartials = function() {
    // Register partials
    handlebars.registerPartial(
      'email.alert.layout',
      fs.readFileSync(templatesUrl + 'layouts/email.alert.hbs', 'utf8'));
  };

  controller.registerHelpers = function() {
    // layout helpers
    handlebars.registerHelper(layouts(handlebars));
    //  format an ISO date using Moment.js
    //  moment syntax example: moment(Date("2011-07-18T15:50:52")).format("MMMM YYYY")
    //  usage: {{dateFormat creation_date format="MMMM YYYY"}}
    handlebars.registerHelper('dateFormat', function(context, block) {
      var f = block.hash.format || "MMM Do, YYYY";
      return moment(context).format(f);
    });
  };

  controller.registerPartials();
  controller.registerHelpers();
  module.exports = controller;

}());
