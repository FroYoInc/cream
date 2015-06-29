/// <reference path="./models/User"/>

import r = require('rethinkdb');
import restify = require('restify');
import DBUtils = require('./dbutils/migrator');
import c  = require('./config');
<<<<<<< HEAD
import userService = require('./services/user-service');
import errors = require('./errors/errors');
=======
import EmailService = require('./services/email-service');
import models = require('./models/models');
import user = require('./models/user');
import Promise = require('bluebird');

import sessions = require('express-session');
import auth = require('./services/user-auth');
import userSer = require('./services/user-service');

var RDBStore = new (require('session-rethinkdb'))(sessions);

>>>>>>> 2140b512bc8f38b491a0f4376c91e31c715c0b82

var migrator = new DBUtils.Migrator();
migrator.migrate(c.Config.db);

var server = restify.createServer({
  name: 'Waffle Cone',
  version: '0.0.0'
});

<<<<<<< HEAD
server.use(restify.queryParser());

server.get('/authentication/:auth', function (req, res, next) {
  var authenticate = req.params.auth;
  var create_user = userService.createUser (
    'firstname', 'lastname',
    'username', 'email@email.com',
    'phash', 'salt')


  userService.activateUser(authenticate)
    .then((user) => {
    console.log(user)
    })
    .catch((err) => {
      console.error(err)
    });
  console.log("req.params.auth:" + req.params.auth);
  res.send(200);
  next();
});

=======
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

var routes = new (require('./routes'))(server);
>>>>>>> 2140b512bc8f38b491a0f4376c91e31c715c0b82

server.get('/flavors', function(req, res, next) {
  var flavors : string[] = ['Peanut Butter', 'Cookies N Cream', 'Cake Batter'];
  res.send({'flavors': flavors});
  next();
});



server.listen(c.Config.app.port, function() {
  console.log('> %s listening on %s', server.name, server.url);
});