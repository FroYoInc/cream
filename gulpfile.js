var gulp = require('gulp');
var ts = require('gulp-typescript');
var debug = require('gulp-debug');

var tsProject = ts.createProject('tsconfig.json');
var tsOutDir = tsProject.config.compilerOptions.outDir;
var tsFilesGlob = tsProject.config.filesGlob;

gulp.task('transpile-ts2js', function () {
  var tsResults = tsProject.src().pipe(ts(tsProject));
  return tsResults.js.pipe(gulp.dest(tsOutDir));
});

gulp.task('watch-ts-files', function() {
   gulp.watch(tsFilesGlob, ['transpile-ts2js']);
});

gulp.task('default', ['watch-ts-files', 'transpile-ts2js']);
