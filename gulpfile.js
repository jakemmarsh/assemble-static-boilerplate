'use strict';

var gulp           = require('gulp'),
    jshint         = require('gulp-jshint'),
    browserify     = require('gulp-browserify'),
    uglify         = require('gulp-uglify'),
    assemble       = require('gulp-assemble'),
    htmlmin        = require('gulp-htmlmin'),
    imagemin       = require('gulp-imagemin'),
    pngcrush       = require('imagemin-pngcrush'),
    sass           = require('gulp-sass'),
    rename         = require('gulp-rename'),
    refresh        = require('gulp-livereload'),
    lrserver       = require('tiny-lr')(),
    morgan         = require('morgan'),
    express        = require('express'),
    livereload     = require('connect-livereload'),
    livereloadport = 35729,
    serverport     = 3000;

var assembleOptions = {
  data:      'public/data/*.json',
  helpers:   'public/helpers/*.js',
  partials:  'public/templates/partials/*.hbs',
  layoutdir: 'public/templates/layouts/'
};

/************************************************
  Web Server
 ***********************************************/

var server = express();
// log all requests to the console
server.use(morgan('dev'));
// Add live reload
server.use(livereload({port: livereloadport}));
server.use(express.static('./build'));

/************************************************
  Gulp Tasks
 ***********************************************/

// JSHint task
gulp.task('lint', function() {

  gulp.src('./public/js/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'));

});

// Browserify task
gulp.task('browserify', function() {

  // Single point of entry (make sure not to src ALL your files, browserify will figure it out for you)
  gulp.src(['public/js/main.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: true
  }))
  .pipe(uglify())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('build/js'))
  .pipe(refresh(lrserver));

});

// Styles task
gulp.task('styles', function() {

  gulp.src('public/styles/main.scss')
  // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
  .pipe(sass({style: 'compressed', onError: function(e) { console.log(e); } }))
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest('build/css/'))
  .pipe(refresh(lrserver));

});

// Pages task
gulp.task('pages', function() {
// Images task
gulp.task('images', function() {

  // Run imagemin task on all images
  return gulp.src('public/images/**/*')
          .pipe(imagemin({
              progressive: true,
              svgoPlugins: [{removeViewBox: false}],
              use: [pngcrush()]
          }))
          .pipe(gulp.dest('build/images'));

});

  // Run assemble on static pages
  gulp.src('./public/templates/pages/**/*.hbs')
  .pipe(assemble(assembleOptions))
  .pipe(htmlmin())
  .pipe(gulp.dest('_gh_pages/'))
  .pipe(gulp.dest('build/'));

});

gulp.task('watch', function() {

  // Watch our scripts
  gulp.watch(['public/js/**/*.js'],[
    'lint',
    'browserify'
  ]);
  // Watch our styles
  gulp.watch(['public/styles/**/*.scss'], [
    'styles'
  ]);
  // Watch our templates
  gulp.watch(['public/templates/**/*.hbs', 'public/data/*.json', 'public/helpers/*.js'], [
    'pages'
  // Watch our images
  gulp.watch(['public/images/**/*'], [
    'images'
  ]);
  ]);

});

// Dev task
gulp.task('dev', function() {

  // Start webserver
  server.listen(serverport);
  // Start live reload
  lrserver.listen(livereloadport);

  // Run all tasks once
  gulp.start(['browserify', 'styles', 'pages']);

  // Then, run the watch task to keep tabs on changes
  gulp.start('watch');

});