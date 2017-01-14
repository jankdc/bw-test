"use strict";

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const karmaSv = require('karma').Server;
const sequence = require('run-sequence');
const del = require('del');

gulp.task('clean', () => {
  return del([
    'public/js/scripts.js',
    'public/css/styles.css',
    'docs'
  ]);
});

gulp.task('jslints', () => {
  return gulp.src([
    '!node_modules/**',
    'public/js/*.js',
    'routes/**/*.js',
    'config/**/*.js',
    'tests/**/*.js',
    '*.js'
    ])
    .pipe(plugins.eslint({configFile: 'eslintrc.json'}))
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

gulp.task('scripts', () => {
  return gulp.src([
      'public/js/vendor/jquery-3.1.1.js',
      'public/js/vendor/wordcloud2.js',
      'public/js/vendor/canteen.js',
      'public/js/topic-cloud.js',
      'public/js/main.js'
    ])
    .pipe(plugins.uglify())
    .pipe(plugins.concat('scripts.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('styles', () => {
  return gulp.src([
      'public/css/vendor/normalize.css',
      'public/css/main.css'
    ])
    .pipe(plugins.cleanCss())
    .pipe(plugins.concat('styles.css'))
    .pipe(gulp.dest('public/css'));
});

gulp.task('server-test', () => {
  return gulp.src('tests/server/*.js')
    .pipe(plugins.mocha())
});

gulp.task('client-test', (done) => {
  new karmaSv({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

gulp.task('gdocs', (done) => {
  gulp.src([
    'README.md', 
    'public/js/*.js',
    ], { read: false })
    .pipe(plugins.jsdoc3(done));
});

gulp.task('tests', (done) => {
  sequence('client-test', 'server-test', done);
});

gulp.task('devel', () => {
  sequence('jslints', 'tests', () => {
    plugins.nodemon({ 
      script: 'bin/www',
      ext: 'html js css',
      tasks: ['jslints', 'tests'],
      ignore: ['public/js/scripts.js', 'public/css/styles.css']
    });
  });
});

gulp.task('default', ['build'], () => {
  plugins.nodemon({ 
    script: 'bin/www',
    ext: 'html js css',
    ignore: ['public/js/scripts.js', 'public/css/styles.css']
  });
});

gulp.task('build', ['jslints', 'scripts', 'styles']);
