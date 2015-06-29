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




server.get('/flavors', function(req, res, next) {
  var flavors : string[] = ['Peanut Butter', 'Cookies N Cream', 'Cake Batter'];
  res.send({'flavors': flavors});
  next();
});



server.listen(c.Config.app.port, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
