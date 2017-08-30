var config = require("../config/environment");

module.exports = require("stripe")(config.stripe.secret);
