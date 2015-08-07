/// <reference path="./models/User"/>

import r = require('rethinkdb');
import restify = require('restify');
import DBUtils = require('./dbutils/migrator');
import c  = require('./config');
import Controller = require('./controllers/controllers');
import EmailService = require('./services/email-service');
import models = require('./models/models');
import user = require('./models/user');
import Promise = require('bluebird');
import sessions = require('express-session');
import userSer = require('./services/user-service');
import requestService = require('./services/request-service');

var RDBStore = new (require('session-rethinkdb'))(sessions);

var migrator = new DBUtils.Migrator();
migrator.migrate(c.Config.db);

var server = restify.createServer({
  name: 'Waffle Cone',
  version: '0.0.0'
});

//noinspection JSValidateTypes
server.use(sessions({

  // This should Ideally be random generated on install, that way each
  // server will have a different key
  secret: 'thisIsOurSecretKeyDontLoseIt',

  cookie:{
    // enable this when we have https set up to secure our session cookies
    //secure:true,
    maxAge: 24 * 60 * 60 * 1000  // One day in milliseconds
  },
  store: RDBStore({
    servers: [
        {host: 'localhost', port: c.Config.db.port}
    ],
    cleanupInterval: 60000, // optional, default is 60000 (60 seconds)
    table: 'session', // optional, default is 'session'
    db: "froyo"
  }),


  // Setting resave to false prevents the session from being saved to
  // the store when to changes have been made.
  resave:false,

  // This prevents empty sessions from being stored.
  saveUninitialized:false
}));

// Restify body parser provides all of the info sent to the route
// in a JSON object.
server.use(restify.bodyParser());
server.use(restify.queryParser());

var routes = new (require('./routes'))(server);

server.listen(c.Config.app.port, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
