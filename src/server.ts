import r = require('rethinkdb');
import restify = require('restify');
import dbutils = require('./dbutils/migrator');
var config  = require('./config.json');

var migrator = new dbutils.Migrator();
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

server.listen(8080, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
