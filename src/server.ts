import r = require('rethinkdb');
import restify = require('restify');
import DBUtils = require('./dbutils/migrator');
import c  = require('./config');

var migrator = new DBUtils.Migrator();
migrator.migrate(c.Config.db);

var server = restify.createServer({
  name: 'Waffle Cone',
  version: '0.0.0'
});

server.use(restify.bodyParser({mapParams: true}));

server.get('/flavors', function(req, res, next) {
  var flavors : string[] = ['Peanut Butter', 'Cookies N Cream', 'Cake Batter'];
  res.send({'flavors': flavors});
  next();
});

server.post('/users', function (req, res, next){

  console.log(req.body);
  res.end();
});

server.listen(c.Config.app.port, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
