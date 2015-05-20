import restify = require('restify');

var server = restify.createServer({
  name: 'emulsion',
  version: '0.0.0'
});

server.get('/flavors', function(req, res, next) {
  var flavors : string[] = ['Peanut Butter', 'Cookies N Cream', 'Cake Batter']
  res.send({'flavors': flavors});
  next();
});

server.listen(8080, function() {
  console.log('> %s listening on %s', server.name, server.url);
});
