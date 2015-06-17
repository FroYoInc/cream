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

server.listen(config.app.port, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
