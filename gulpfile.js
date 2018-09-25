let bs = require('browser-sync')
let browserify = require('browserify')
let buffer = require('vinyl-buffer')
let del = require('del')
let gulp = require('gulp')
let source = require('vinyl-source-stream')
let sourcemaps = require('gulp-sourcemaps')
let ts = require('gulp-typescript')
let tsify = require('tsify')
let uglify = require('gulp-uglify')

function build() {
  return browserify({
    basedir: '.',
    debug: true,
    entries: ['src/sticky.ts'],
    cache: {},
    packageCache: {},
    standalone: 'stickyts'
  })
  .plugin(tsify)
  .transform('babelify', {
    presets: ['@babel/preset-env'],
    extensions: ['.ts']
  })
  .bundle()
  .pipe(source('sticky.min.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('dist'));
}

function clean() {
  return del([ './dist' ])
}

function js() {
  return browserify({
    basedir: '.',
    debug: true,
    entries: ['src/sticky.ts'],
    cache: {},
    packageCache: {},
    standalone: 'stickyts'
  })
  .plugin(tsify)
  .transform('babelify', {
    presets: ['@babel/preset-env'],
    extensions: ['.ts']
  })
  .bundle()
  .pipe(source('sticky.js'))
  .pipe(buffer())
  .pipe(gulp.dest('dist'));
}

function serve() {
  let browserSync = bs.create();
  gulp.watch('./src/*.ts', gulp.series(build))

  gulp.watch('./docs/*.html').on('change', browserSync.reload);
  gulp.watch('./dist/*.js').on('change', browserSync.reload);

  return browserSync.init({
    server: {
      baseDir: './',
      directory: true,
    },

    startPath: '/docs/index.html',
  });
}

gulp.task('build', gulp.series(clean, build, js))
gulp.task('clean', clean)
gulp.task('serve', gulp.series(clean, 'build', serve))