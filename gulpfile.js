var gulp   = require('gulp');
var $      = require('gulp-load-plugins')();
var spawn  = require('child_process').spawn;
var path   = require('path');
var config = require('./config.js');


var ts           = $.typescript;
var tsProject    = ts.createProject(config.tsConfigFile);
var server       = null;
var failOnErrors = false;

$.del = require('del');
$.ts = $.typescript;

var handleError = function(err) {
  if (failOnErrors) {
    $.util.log(err.message);
    process.exit(1);
  }
}

gulp.task('clean-js', function(cb) {
  $.del(config.tsOutDir, cb);
});

gulp.task('transpile-ts2js', ['clean-js'], function () {
  return tsProject.src()
                  .pipe($.ts(tsProject))
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
    .pipe($.jasmine());
});

gulp.task('default', ['unit-tests', 'restart-server'], function() {
   gulp.watch(config.tsFilesGlob, ['unit-tests', 'restart-server']);
});

gulp.task('test', function() {
  failOnErrors = true;
  gulp.start(['unit-tests']);
});

gulp.task('build', ['test']);
