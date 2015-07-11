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

var jo = function(a) {
  return join(outDir(), a);
}

var not = function(a) {
  return '!' + a;
}

var migratorTest = function() {
  return jo('integration/dbutils/migrator.spec.js');
}

module.exports = {
  'smtp': {
    'port': 8081,
    'user': 'no-reply@froyo.com',
    'pass': 'froyo'
  },
  'tsConfigFile': 'tsconfig.json',
  'tsconfig': tsConfig(),
  'tsd': tsd(),
  'package': package,
  'tsOutDir': outDir(),
  'tsFilesGlob': tsConfig().filesGlob,
  'initFilePath': jo('src/server.js'),
  'integrationFiles':  {
    'stg0': migratorTest(),
    'stg1': [jo('integration/**/**.spec.js'), not(migratorTest())],
  },
  'testFiles': jo('test/**/*.spec.js')
}
