'use strict';

var gulp           = require('gulp'),
    gulpif         = require('gulp-if'),
    runSequence    = require('run-sequence'),
    clean          = require('gulp-clean'),
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
    livereloadport = 35728,
    serverport     = 3000,
    isProd         = false;

var assembleOptions = {
  data:      'public/data/**/*.json',
  helpers:   'public/helpers/**/*.js',
  partials:  'public/templates/partials/**/*.hbs',
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

 gulp.task('clean', function() {

  return gulp.src('build/', {read: false})
          .pipe(clean());

 });

// JSHint task
gulp.task('lint', function() {

  return gulp.src('./public/js/**/*.js')
          .pipe(jshint())
          .pipe(jshint.reporter('default'));

});

// Browserify task
gulp.task('browserify', function() {

  // Single point of entry (make sure not to src ALL your files, browserify will figure it out for you)
  return gulp.src(['public/js/main.js'])
          .pipe(browserify({
            insertGlobals: true,
            debug: true
          }))
          .pipe(gulpif(isProd, uglify()))
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('build/js'))
          .pipe(refresh(lrserver));

});

// Styles task
gulp.task('styles', function() {

  return gulp.src('public/styles/main.scss')
          // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
          .pipe(sass({
            style: isProd ? 'compressed' : 'expanded',
            onError: function(e) { console.log(e); }
          }))
          .pipe(rename({suffix: '.min'}))
          .pipe(gulp.dest('build/css/'))
          .pipe(refresh(lrserver));

});

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

// Assemble task
gulp.task('assemble', function() {

  // Run assemble on static pages
  return gulp.src('./public/pages/**/*.hbs')
          .pipe(assemble(assembleOptions))
          .pipe(gulpif(isProd, htmlmin()))
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
  // Watch our templates, helpers, and data files
  gulp.watch(['public/pages/**/*.hbs', 'public/templates/**/*.hbs', 'public/data/*.json', 'public/helpers/*.js'], [
    'assemble'
  ]);

});

// Dev task
gulp.task('dev', function() {

  isProd = false;

  // Start webserver
  server.listen(serverport);
  // Start live reload
  lrserver.listen(livereloadport);

  // Clean build directory
  gulp.start('clean');

  // Run all tasks once
  runSequence('styles', 'browserify', 'assemble');

  // Copy images into build directory since we're not compressing
  gulp.src('public/images/**/*').pipe(gulp.dest('build/images'));

  // Then, run the watch task to keep tabs on changes
  gulp.start('watch');

});


// Deploy task
gulp.task('deploy', function() {

  // Deploy to your hosting setup

});

// Production task
gulp.task('prod', function() {

  isProd = true;

  // Run all tasks
  runSequence('styles', 'images', 'browserify', 'assemble', 'deploy');

});