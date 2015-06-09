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

module.exports = {
  'tsConfigFile': 'tsconfig.json',
  'tsconfig': tsConfig(),
  'tsd': tsd(),
  'package': package,
  'tsOutDir': tsConfig().compilerOptions.outDir,
  'tsFilesGlob': tsConfig().filesGlob,
  'initFilePath': path.join(tsConfig().compilerOptions.outDir, 'server.js'),
  'testFiles': path.join(tsConfig().compilerOptions.outDir, 'test/*.js')
}
