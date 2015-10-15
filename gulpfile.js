var gulp = require('gulp');
var ngrok = require('ngrok');
var psi = require('psi');
var sequence = require('run-sequence');
var browserSync = require('browser-sync');
var site = '';
var portVal = 3020;

gulp.task('ngrok-url', function(cb) {
  return ngrok.connect(portVal, function (err, url) {
    site = url;
    console.log('serving your tunnel from: ' + site);
    cb();
  });
});

gulp.task('psi-desktop', function(cb) {
  psi.output( site, {
    nokey: 'true',
    strategy: 'desktop',
    threshold: 20
  },cb);
});

gulp.task('psi-mobile', function(cb) {
  psi.output( site, {
    nokey: 'true',
    strategy: 'mobile',
    threshold: 20
  },cb);
});

gulp.task('browser-sync-psi', function(cb) {
  browserSync({
    port: portVal,
    open: false,
    server: {
      baseDir: './'
    }
  },cb);
});

gulp.task('psi-seq', function(cb) {
  return sequence(
    'browser-sync-psi',
    'ngrok-url',
    'psi-desktop',
    'psi-mobile',
    function(err) {
      //if any error happened in the previous tasks, exit with a code > 0
      if (err) {
        var exitCode = 2;
        console.log('[ERROR] gulp build task failed', err);
        console.log('[FAIL] gulp build task failed - exiting with code ' + exitCode);
        // return process.exit(exitCode);
        return cb(); // continue
      }
      else {
        return cb();
      }
    }
  );
});

gulp.task('psi', ['psi-seq'], function() {
  console.log('Woohoo! Check out your page speed scores!');
  process.exit();
});

gulp.task('default', function() {
  console.log("Gulp ready");
});
