var gulp = require('gulp');
var del = require('del');
var ts = require('gulp-typescript');
var debug = require('gulp-debug');
var spawn = require('child_process').spawn;

var tsProject = ts.createProject('tsconfig.json');
var tsOutDir = tsProject.config.compilerOptions.outDir;
var tsFilesGlob = tsProject.config.filesGlob;
var serverPath = './built/server.js';
var server = null;

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
  return server = spawn('node', [serverPath], {stdio: 'inherit'});
});

gulp.task('unit-tests', ['transpile-ts2js'], function() {
  // Run jasmine tests
});

gulp.task('watch-ts-files', function() {
   gulp.watch(tsFilesGlob, ['restart-server','unit-tests']);
});

gulp.task('default', ['watch-ts-files']);
