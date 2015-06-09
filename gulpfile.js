var config = require('./config.js');
var del   = require('del');
var spawn = require('child_process').spawn;
var path  = require('path');
var gulp  = require('gulp');
var debug = require('gulp-debug');
var ts    = require('gulp-typescript');
var jasmine = require('gulp-jasmine');
var gutil = require('gulp-util');

var tsProject    = ts.createProject(config.tsConfigFile);
var server       = null;
var failOnErrors = false;

var handleError = function(err) {
  if (failOnErrors) {
    gutil.log(err.message);
    process.exit(1);
  }
}

gulp.task('clean-js', function(cb) {
  del(config.tsOutDir, cb);
});

gulp.task('transpile-ts2js', ['clean-js'], function () {
  return tsProject.src()
                  .pipe(ts(tsProject))
                  .on('error', handleError)
                  .js
                  .pipe(gulp.dest(config.tsOutDir));
});

gulp.task('restart-server', ['transpile-ts2js'], function() {
  if (server) server.kill()
  return server = spawn('node', [config.initFilePath], {stdio: 'inherit'});
});

gulp.task('unit-tests', ['transpile-ts2js'], function() {
  return gulp.src(config.testFiles)
    .pipe(jasmine());
});

gulp.task('default', ['unit-tests', 'restart-server'], function() {
   var files = [config.tsFilesGlob, config.tsConfigFile];
   gulp.watch(files, ['unit-tests', 'restart-server']);
});

gulp.task('test', function() {
  failOnErrors = true;
  gulp.start(['unit-tests']);
});

gulp.task('build', ['test']);
