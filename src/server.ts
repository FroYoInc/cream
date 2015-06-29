import r = require('rethinkdb');
import restify = require('restify');
import DBUtils = require('./dbutils/migrator');
import c  = require('./config');
import userService = require('./services/user-service');
import errors = require('./errors/errors');

var migrator = new DBUtils.Migrator();
migrator.migrate(c.Config.db);

var server = restify.createServer({
  name: 'Waffle Cone',
  version: '0.0.0'
});

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


server.get('/flavors', function(req, res, next) {
  var flavors : string[] = ['Peanut Butter', 'Cookies N Cream', 'Cake Batter'];
  res.send({'flavors': flavors});
  next();
});



server.listen(c.Config.app.port, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
