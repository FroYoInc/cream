var path = require('path');

var tsConfig = function() {
  return require('./tsconfig.json');
};

var tsd = function() {
 return require('./tsd.json');
};

var package = function() {
  return require('./package.json');
}

var outDir = function() {
  return tsConfig().compilerOptions.outDir;
}

var join = function(a, b) {
  return path.join(a, b);
}

module.exports = {
  'tsConfigFile': 'tsconfig.json',
  'tsconfig': tsConfig(),
  'tsd': tsd(),
  'package': package,
  'appConfigFiles': 'src/**/*.json',
  'appConfigOutDir': join(outDir(), 'src/'),
  'tsOutDir': outDir(),
  'tsFilesGlob': tsConfig().filesGlob,
  'initFilePath': join(outDir(), 'src/server.js'),
  'integrationFiles': join(outDir(), 'integration/**/**.spec.js'),
  'testFiles': join(outDir(), 'test/**/*.spec.js')
}
