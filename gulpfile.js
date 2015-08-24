var gulp       = require('gulp');
var $          = require('gulp-load-plugins')();
var spawn      = require('child_process').spawn;
var path       = require('path');
var SMTPServer = require('smtp-server').SMTPServer;
var config     = require('./config.js');


var ts           = $.typescript;
var tsProject    = ts.createProject(config.tsConfigFile);
var server       = null;
var smtpServer   = null;
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

gulp.task('restart-smtp-server', function(cb) {
  var smtpOpts = {
    disabledCommands: ['STARTTLS'],
    logger: false,
    onAuth: function (auth, session, callback) {
      if (auth.username !== config.smtp.user ||
        auth.password !== config.smtp.pass) {
        return callback(new Error('Invalid username or password'));
      }
      callback(null, {user: config.smtp.user});
    },
    onData: function (stream, session, callback) {
      stream.pipe(process.stdout);
      stream.on('end', callback);
    },
  };
  if (smtpServer) {
    smtpServer.close(function() {
      smtpServer = new SMTPServer(smtpOpts);
      smtpServer.listen(config.smtp.port, cb);
    });
  } else {
    smtpServer = new SMTPServer(smtpOpts);
    smtpServer.listen(config.smtp.port, cb);
  }
});

gulp.task('restart-app-server', ['transpile-ts2js'], function() {
  if (server) server.kill()
  return server = spawn('node', [config.initFilePath], {stdio: 'inherit'});
});

gulp.task('restart-servers', ['restart-app-server', 'restart-smtp-server']);

gulp.task('unit-tests', ['transpile-ts2js'], function() {
  return gulp.src(config.testFiles)
    .pipe($.jasmine())
    .on('error', handleError);
});

gulp.task('integration-test-stg0', ['transpile-ts2js'], function() {
  return gulp.src(config.integrationFiles.stg0)
    .pipe($.jasmine())
    .on('error', handleError);
});

gulp.task('integration-test-stg1', ['integration-test-stg0',
'transpile-ts2js'], function() {
  setTimeout(function () {
    return gulp.src(config.integrationFiles.stg1)
      .pipe($.jasmine())
      .on('error', handleError);
  }, 5000);

});

gulp.task('integration-tests', ['integration-test-stg0',
'integration-test-stg1']);


gulp.task('default', ['unit-tests', 'restart-servers'], function() {
   var files = [config.tsFilesGlob, config.tsConfigFile];
   gulp.watch(files, ['unit-tests', 'restart-servers']);
});

gulp.task('test', function() {
  failOnErrors = true;
  gulp.start(['unit-tests']);
});

gulp.task('integrate', function() {
  failOnErrors = true;
  gulp.start(['integration-tests']);
});

gulp.task('build', ['test']);
