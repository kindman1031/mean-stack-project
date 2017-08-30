/*
 * Notification Controller: centralize all notifications to admins and users
 */
(function() {
  'use strict';

  var Mailgun = require('mailgun-js');
  var config = require('../../config/environment');
  var templateController = require('../template/template.controller.js');
  var debug = require('debug')(APP_NAME.concat(':notification.controller'));
  // mailgun instance
  var mg = new Mailgun({
    apiKey: config.mailgun.api_key,
    domain: config.mailgun.domain
  });
  // controller instance
  var controller = {};

  /*
   * Pickup notifications
   * @param: {DeliveryModel} delivery
   */
  controller.pickupNotification = function(delivery) {
    // get delivery emails to send to
    var tos = config.mailRecipients.delivery.replace(/ +?/g, '').split(',');
    // compile template
    var emailBody = templateController.compile('email.pickup', delivery);
    var messageData = {
      from: config.mailgun.sender,
      to: tos,
      subject: 'Pickup requested from ' + delivery.customer.firstName,
      html: emailBody
    };
    controller.sendEmail(messageData);
  };

  /*
   * Delivery notifications
   * @param: {DeliveryModel} delivery
   */
  controller.deliveryNotification = function(delivery) {
    // get delivery emails to send to
    var tos = config.mailRecipients.delivery.replace(/ +?/g, '').split(',');
    // compile template
    var emailBody = templateController.compile('email.delivery', delivery);
    var messageData = {
      from: config.mailgun.sender,
      to: tos,
      subject: 'Delivery requested from ' + delivery.customer.firstName,
      html: emailBody
    };
    controller.sendEmail(messageData);
  };

  /*
   * Admin support notifications
   * @param: {SupportModel} supportObj
   */
  controller.adminSupportNotification = function(supportObj) {
    // get support emails to send to
    var tos = config.mailRecipients.support.replace(/ +?/g, '').split(',');
    // compile template
    var emailBody = templateController.compile('email.adminSupport', supportObj);
    var messageData = {
      from: config.mailgun.sender,
      to: tos,
      subject: 'Support message submitted by ' + supportObj.customer.firstName,
      html: emailBody
    };
    controller.sendEmail(messageData);
  };

  /*
   * Send emails
   * @param: {Object} data
   */
  controller.sendEmail = function(data) {
    mg.messages().send(data, function(err, body) {
      if (err) {
        debug('Error sending email: ', data);
        debug('err: ', err);
        debug('body: ', body);
        // @TODO: handle email errors by possible queue system
      } else {
        debug('Mail Response', body);
        debug('Sent email: ', {
          from: data.from,
          to: data.to,
          subject: data.subject
        });
      }
    });

  };

  module.exports = controller;
}());
