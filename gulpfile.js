var gulp = require('gulp');
var ts = require('gulp-typescript');
var debug = require('gulp-debug');

var tsProject = ts.createProject('tsconfig.json');

gulp.task('transpile-ts2js', function () {
  var dest = tsProject.options.outDir;
  var tsResults = tsProject.src().pipe(ts(tsProject));
  return tsResults.js.pipe(gulp.dest(dest));
});

gulp.task('default', ['transpile-ts2js']);
