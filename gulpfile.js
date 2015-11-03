var gulp = require('gulp');
var ngrok = require('ngrok');
var psi = require('psi');
var sequence = require('run-sequence');
var browserSync = require('browser-sync');
var taskListing = require('gulp-task-listing');
var imageop = require('gulp-image-optimization');
var minifyCss = require('gulp-minify-css');
var minifyhtml = require('gulp-minify-html');
var uglify = require('gulp-uglify');
var del = require('del');
var inject = require('gulp-inject');

var site = '';
var portVal = 3020;

gulp.task('psi', function(cb) {
  sequence(
   'build',
   'psi-seq',
   cb
  );
});

gulp.task('serve', function(cb) {
  sequence(
    'clean',
    'build',
    '_browse',
    cb
  );
});

gulp.task('build', ['_scripts', '_styles','_images', '_content']);

gulp.task('help', taskListing.withFilters(null, 'default'));

gulp.task('default', ['help']);

gulp.task('clean', function(){
  del(['js/*', 'img/*', 'css/*', '*.html', '!source/**']).then(function (paths) {
      console.log('Deleted files/folders:\n', paths.join('\n'));
  });
});

gulp.task('_browse', function(){
    browserSync({
        port: 3030,
        browser: "google chrome",
        server: {
            baseDir: "./"
        }
    });

    gulp.watch('source/js/*', ['script-watch']);
    gulp.watch('source/css/*', ['css-watch']);
    gulp.watch('source/*.html', ['content-watch']);
    gulp.watch('source/img/*', ['image-watch']);
});

gulp.task('_styles', function(){
  return gulp.src('source/css/*.css')
    .pipe(minifyCss({compatibility: 'ie8'}))
    .pipe(gulp.dest('css'));
});

gulp.task('_images', function() {
    return gulp.src('source/img/*')
      .pipe(imageop({
          optimizationLevel: 5
      }))
      .pipe(gulp.dest('img'));
});

gulp.task('_scripts', function() {
    return gulp.src('source/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('js'));
});

gulp.task('_content', function() {
    return gulp.src('source/*.html')
        .pipe(inject(gulp.src('source/css/style.css').pipe(minifyCss({compatibility: 'ie8'})), {
          starttag: '/* inject:head:css */',
          endtag: '/* endinject */',
          transform: function (filePath, file) {
            return file.contents.toString('utf8');
          }
        }))
        .pipe(minifyhtml({
            empty: true,
            quotes: true
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('css-watch', ['_styles'], browserSync.reload);
gulp.task('content-watch', ['_content'], browserSync.reload);
gulp.task('image-watch', ['_images'], browserSync.reload);
gulp.task('script-watch', ['_scripts'], browserSync.reload);


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
  sequence(
    'browser-sync-psi',
    'ngrok-url',
    'psi-desktop',
    'psi-mobile',
    cb
  );
});

