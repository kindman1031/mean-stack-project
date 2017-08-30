var express = require('express'),
  should = require('should');
require('express-test');

var app = express.createServer();

// require the route you're going to test
require('../server/routes')(app);

// test the body
app.request().get('/').end()
  .verify(function(res) {
    res.body.should.any();
  });

// set sinon expectations on the response mock
app.request().get('/').end(function() {
  res.expects('send').once();
}).verify();
