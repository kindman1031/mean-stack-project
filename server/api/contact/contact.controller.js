(function() {
  'use strict';

  var Mailgun = require('mailgun-js');
  var config = require('../../config/environment');
  var debug = require('debug')(APP_NAME.concat(':contact.controller'));

  // Creates a new contact in the DB.
  exports.create = function(req, res) {
    var mg = new Mailgun({
      apiKey: config.mailgun.api_key,
      domain: config.mailgun.domain
    });

    var data = {
      from: req.body.email,
      to: config.mailgun.recipient,
      subject: 'Contact Form from ' + req.body.name,
      html: req.body.message
    };

    //Invokes the method to send emails given the above data with the helper library
    mg.messages().send(data, function(err, body) {
      //If there is an error, render the error page
      if (err) {
        res.status(err.statusCode).send({
          error: err,
          fromMG: true,
          apiKey: config.mailgun.api_key,
          data: data,
          body: req.body
        });
      }
      //Else we can greet    and leave
      else {
        res.status(200).send(data);
      }
    });
  };

  function handleError(res, err) {
    return res.send(500, err);
  }

}());
