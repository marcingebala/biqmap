var gulp = require('gulp');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');

//przenosimy kod z folderu deb/js do csripts
gulp.task('js-admin', function() {
  return gulp.src('./public-dev/js/admin/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('admin.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('js-embed', function() {
  return gulp.src('./public-dev/js/embed/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('embed.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('js-intro', function() {
  return gulp.src('./public-dev/js/intro/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('intro.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('js-map', function() {
  return gulp.src('./public-dev/js/map/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('map.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('js-project', function() {
  return gulp.src('./public-dev/js/project/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('project.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/js/'));
});

//przerabiamy pliku sass do css oraz dodajemy do nich soutcemaps
gulp.task('sass-admin', function () {
  return gulp.src('./public-dev/sass/admin/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(concat('admin.css'))
  .pipe(gulp.dest('./public/css/'));
}); 

gulp.task('sass-embed', function () {
  return gulp.src('./public-dev/sass/embed/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(concat('embed.css'))
  .pipe(gulp.dest('./public/css/'));
}); 

gulp.task('sass-intro', function () {
  return gulp.src('./public-dev/sass/intro/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(concat('intro.css'))
  .pipe(gulp.dest('./public/css/'));
}); 

gulp.task('sass-map', function () {
  return gulp.src('./public-dev/sass/map/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(concat('map.css'))
  .pipe(gulp.dest('./public/css/'));
}); 

gulp.task('sass-project', function () {
  return gulp.src('./public-dev/sass/project/*.scss')
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(concat('project.css'))
  .pipe(gulp.dest('./public/css/'));
}); 

//obserwujemy wybrane pliki js i sass
gulp.task('watch', function () {
  gulp.watch('./public-dev/**/*.scss', ['sass-admin','sass-embed','sass-intro','sass-map','sass-project']);
  gulp.watch('./public-dev/**/*.js', ['js-admin','js-embed','js-intro','js-map','js-project']);
});
