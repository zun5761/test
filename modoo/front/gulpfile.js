'use strict';

var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith-multi');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var csso = require('gulp-csso');
var inject = require('gulp-inject');
var merge = require('merge-stream');
var md5 = require('gulp-md5-plus');
var buffer = require('vinyl-buffer');
var clean = require('gulp-clean');

var scssFiles = 'src/scss/**/*.scss';
var imgFiles = 'src/img/sprites/**/*.png';
var spriteScssFiles = 'src/scss/import/sprite/*.scss';

gulp.task('sass', function(){
  return gulp.src(scssFiles)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compact' // output style is [nested | expanded | compact | compressed]
    }).on('error', sass.logError))
    .pipe(autoprefixer({browsers: ['iOS >= 1', 'Android >= 1', 'and_chr >= 1', 'Chrome >=1'], cascade: false}))
    .pipe(sourcemaps.write('.', {includeContent: false, sourceRoot: 'src/scss'}))
    .pipe(gulp.dest('src/css'));
});

gulp.task('sass:dist', function(){
    return gulp.src(scssFiles)
    .pipe(sass({
      outputStyle: 'compact' // output style is [nested | expanded | compact | compressed]
    }).on('error', sass.logError))
    .pipe(autoprefixer({browsers: ['iOS >= 1', 'Android >= 1', 'and_chr >= 1', 'Chrome >=1'], cascade: false}))
    .pipe(gulp.dest('src/css'));
});

gulp.task('watch', ['sass'], function(){
  gulp.watch(scssFiles, ['sass']);
});

gulp.task('sprite', ['clean:sprite'], function(){
  var spriteData = gulp.src(imgFiles)
    .pipe(spritesmith({
      spritesmith: function(options){
        var name = options.imgName.split('.')[0];
        options.cssName = '_' + name + '.scss';
        options.padding = 2;
        options.cssFormat = 'scss';
        options.imgPath = '../img/' + name;
        options.cssTemplate = 'scss.template.handlebars';
        options.cssVarMap = function(sprite){
          sprite.name = name + '-' + sprite.name;
        };
        options.cssSpritesheetName = name;
      }
    }))
    .on('error', function (err) {
      console.log(err)
    });

  var imgStream = spriteData.img
      .pipe(buffer())
      .pipe(md5(6, 'src/scss/import/sprite/*.scss'))
      .pipe(gulp.dest('src/img'));
  var cssStream = spriteData.css.pipe(gulp.dest('src/scss/import/sprite'));

  return merge(imgStream, cssStream);
});

gulp.task('clean:sprite', function () {
    return gulp.src('src/img/sp_*.png' , {read: false})
        .pipe(clean());
});

gulp.task('inject:test', function(){
  return gulp.src(['src/scss/*.scss'])
    .pipe(inject(gulp.src(spriteScssFiles), {
      starttag: "// inject:scss",
      endtag: "// endinject",
      transform: function(filepath){
        var filename = filepath.split('/_')[1];
        var name = filename.split('.')[0];
        return '@import "import/sprite/' + name + '";';
      }
    }))
    .pipe(gulp.dest('src/scss'));
});

gulp.task('cssmin', function(){
  return gulp.src(['src/css/*.css', '!src/css/*.min.css'])
    .pipe(csso())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('src/css'));
});