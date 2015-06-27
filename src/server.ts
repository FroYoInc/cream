import r = require('rethinkdb');
import restify = require('restify');
import DBUtils = require('./dbutils/migrator');
import c  = require('./config');
import Controller = require('./controllers/controllers');

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


//firstName:string, lastName:string,
//    userName:string, email:string,
//    passwordHash: string, salt: string):Promise<models.User>
server.post('/users', function (req, res, next){

  console.log(req.body);
  var userInfo = req.body;

  //createUser.then()...
  //userService.createUser(userInfo.lastName, userInfo.firstName, userInfo.userName, userInfo.email, userInfo.passwordHash, userInfo.salt).then(res.end());
  //userService.createUser('Smith','Bill', 'EpicRidezFTW', 'bsmith@email.com', 'password', 'salt').then(res.end());

  res.end();
});

server.listen(c.Config.app.port, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
