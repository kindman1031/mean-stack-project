var AWS = require('aws-sdk');
var config = require('../config/environment');
AWS.config.update({ accessKeyId: config.s3.key, secretAccessKey: config.s3.secret });

module.exports.s3 = new AWS.S3();
module.exports.bucket = config.s3.bucket;
