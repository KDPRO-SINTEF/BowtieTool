const gulp = require('gulp');
const del = require('del');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const pug = require('gulp-pug');

const browserSync = require('browser-sync');
browserSync.create();

var Paths = {
  SRC: './src/',
  PUBLIC: './public/',
  PUBLIC_CSS: './public/css/',
  SCSS: './src/scss/**/**',
  SCSS_TOOLKIT_SOURCES: './src/scss/argon-design-system.scss'
};

// Remove public's directory contents
gulp.task('clean', () => {
  return del(`${Paths.PUBLIC}/**`, { force: true });
});

// Copy all assets from the ${Paths.SRC}/assets directory.
gulp.task('copy-assets', () => {
  return gulp.src([`${Paths.SRC}/assets/**/*`]).pipe(gulp.dest(`${Paths.PUBLIC}`));
});

// Compile Sass to CSS
gulp.task('css', () => {
  return gulp.src(Paths.SCSS_TOOLKIT_SOURCES)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(Paths.PUBLIC_CSS));
});

// Compile Pug templates to HTML
gulp.task('templates', () => {
  return gulp.src(`${Paths.SRC}*.pug`)
  .pipe(pug({
    doctype: 'html',
    pretty: true
  }))
  .pipe(gulp.dest(Paths.PUBLIC));
});

// Run a BrowserSync instance & watches
gulp.task('browser-sync', () => {
  browserSync.init({
    server: "./public"
  });

  gulp.watch(Paths.SCSS, gulp.series('css'));
  gulp.watch(Paths.PUBLIC_CSS).on('change', browserSync.reload);
  gulp.watch(`${Paths.SRC}*.pug`, gulp.series('templates')).on('change', browserSync.reload);
});

/**
 * Make a production build
 **/
gulp.task('build', gulp.series('clean', 'copy-assets', 'css', 'templates'));

/**
 * Run a dev server with a live preview (Browsersync)
 **/
gulp.task('watch', gulp.series('build', 'browser-sync'));
