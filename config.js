var package = require('./package.json');
var tsConfig = require('./tsconfig.json');
var tsd = require('./tsd.json');

module.exports = {
  'tsconfig': tsConfig,
  'tsConfigFile': 'tsconfig.json',
  'tsd': tsd,
  'package': package,
  'initFile': 'server.js',
}
