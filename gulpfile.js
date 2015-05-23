var gulp  = require('gulp');
var del   = require('del');
var ts    = require('gulp-typescript');
var debug = require('gulp-debug');
var spawn = require('child_process').spawn;
var path  = require('path');
var jasmine = require('gulp-jasmine');

var tsProject    = ts.createProject('tsconfig.json');
var tsOutDir     = tsProject.config.compilerOptions.outDir;
var tsFilesGlob  = tsProject.config.filesGlob;
var initFile     = path.basename(tsProject.config.initFile, '.ts') + '.js';
var initFilePath = path.join(tsOutDir, initFile);
var server       = null;

gulp.task('clean-js', function(cb) {
  del(tsOutDir, cb);
});

gulp.task('transpile-ts2js', ['clean-js'], function () {
  return tsProject.src()
                  .pipe(ts(tsProject))
                  .js
                  .pipe(gulp.dest(tsOutDir));
});

gulp.task('restart-server', ['transpile-ts2js'], function() {
  if (server) server.kill()
  return server = spawn('node', [initFilePath], {stdio: 'inherit'});
});

gulp.task('unit-tests', ['transpile-ts2js'], function() {
  return gulp.src('built/test/*.js')
    .pipe(jasmine());
});

gulp.task('watch-ts-files', function() {
   gulp.watch(tsFilesGlob, ['unit-tests', 'restart-server']);
});

gulp.task('default', ['watch-ts-files']);
