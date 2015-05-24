var path = require('path');
var package = require('./package.json');
var tsConfig = require('./tsconfig.json');
var tsd = require('./tsd.json');

module.exports = {
  'tsConfigFile': 'tsconfig.json',
  'tsconfig': tsConfig,
  'tsd': tsd,
  'package': package,
  'tsOutDir': tsConfig.compilerOptions.outDir,
  'tsFilesGlob': tsConfig.filesGlob,
  'initFilePath': path.join(tsConfig.compilerOptions.outDir, 'server.js'),
  'testFiles': path.join(tsConfig.compilerOptions.outDir, 'test/*.js')
}
