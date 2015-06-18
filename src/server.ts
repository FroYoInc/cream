/// <reference path="./models/User"/>

import r = require('rethinkdb');
import restify = require('restify');
import DBUtils = require('./dbutils/migrator');
import Config  = require('./config');

var config = Config.Config;
var migrator = new DBUtils.Migrator();
migrator.migrate(config.db);

var server = restify.createServer({
  name: 'Waffle Cone',
  version: '0.0.0'
});

server.get('/flavors', function(req, res, next) {
  var flavors : string[] = ['Peanut Butter', 'Cookies N Cream', 'Cake Batter'];
  res.send({'flavors': flavors});
  next();
});

import email = require('./services/email-service');
server.get('/send-activation', function(req, res, next) {

  var service = new email.EmailService();

  var user : User = new User();
  service.sendActivation(user);

  res.send({'test' : 'test'})
});

server.listen(config.app.port, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
