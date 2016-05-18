'use strict';

var gulp = require('gulp');

// sass 관련 플러그인
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');	

// 브라우저 싱크
var browserSync = require('browser-sync'); // https://www.browsersync.io/docs/options/

// 스프라이트 스미스 관련 플러그인
var merge = require('merge-stream');
var spritesmith = require('gulp.spritesmith');  // https://www.npmjs.com/package/gulp.spritesmith/
var buffer = require('vinyl-buffer');
var md5 = require("gulp-md5-plus");
var clean = require('gulp-clean');
 

// 이미지 옵티마이징 플러그인
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');


var fs = require('fs');
var path = require('path');
var file = require('gulp-file');
var gulp = require('gulp');

// npm install gulp-sass gulp-sourcemaps browser-sync merge-stream gulp.spritesmith vinyl-buffer gulp-md5-plus gulp-imagemin gulp-cache --save-dev

// 환경 변수
var root = './src/';
var src_js = root + 'js/';
var src_css = root + 'css/';
var src_scss = root + 'scss/';
var src_img = root + 'img/';
var src_img_sp = src_img + 'assets/';

var paths = {
	js: src_js + '*.js',
	scss: src_scss + '**/*.scss',
	css: src_css + '*.css',
	html: root + '**/*.html',
	img_sp: src_img_sp + '*.png'
};

var sprimagename = 'spr_contact.png';

// sass
gulp.task('compile-sass',['sprite'], function () {
	return gulp.src(paths.scss)
		.pipe(sourcemaps.init())
		.pipe(sass({
			style: 'compressed'
		}).on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(src_css))
		.pipe(browserSync.reload({
	      stream: true
	    }))
});

// 스프라이트 스미스
gulp.task('sprite',['sprite-clean'], function () {
	
	var spriteData = gulp.src(paths.img_sp)
	.pipe(spritesmith({
		imgName: sprimagename,
		cssName: '_sprite_source.scss',
		cssFormat: 'scss',		
		algorithm: 'binary-tree',
		padding: 6,
		imgPath: '../img/' + sprimagename
// 		imgPath: 'https://ssl.pstatic.net/static/pwe/nm/' + sprimagename		
	}))

	var imgStream = spriteData.img
		.pipe(buffer())
		.pipe(cache(imagemin()))
		.pipe(md5(6, src_scss + '/common/_sprite_source.scss'))
		.pipe(gulp.dest(src_img));
	
	var cssStream = spriteData.css
		.pipe(gulp.dest(src_scss + 'common/'));
		
	return merge(cssStream,imgStream);
});

gulp.task('sprite-clean', function () {
	return gulp.src(src_img + sprimagename.replace('.png','_*.png') , {read: false})
		.pipe(clean());

});


// make index
/* basic */
function getDirectories(dir){
  return fs.readdirSync(dir)
           .filter(function(file){
              if(file.match('[.]{1}.*') || file.match('node_.*')){
                return false;
              }
              return fs.statSync(path.join(dir, file)).isDirectory();
            });
}

function getFiles(dir){
  return fs.readdirSync(dir)
           .filter(function(file){
              return fs.statSync(path.join(dir, file)).isFile();
            });
}

function getHTML(dir){
  return getFiles(dir).filter(function(file){
                         return file.match('.*.html');
                       });
}

function getDirTree(dir){
  var tree = [],
      aDir = getDirectories(dir),
      aHTML = getHTML(dir);

  if((!aDir && aDir.length === 0) && (!aHTML && aHTML.length === 0)){
    return;
  }

  for(var i = 0; i < aDir.length; i++){
    var subDirTree = getDirTree(path.join(dir, aDir[i]));

    if(subDirTree.length !== 0) {
      tree.push(aDir[i]);
      tree.push(subDirTree);
    }
  }

  for(i = 0; i < aHTML.length; i++){
    tree.push(aHTML[i]);
  }

  return tree;
}

function getSimpleDirTree(dir){
  var tree = [],
      aHTML = getHTML(dir);

  if(!aHTML && aHTML.length === 0){
    return;
  }

  for(var i = 0; i < aHTML.length; i++){
    tree.push(aHTML[i]);
  }

  return tree;
}
/* //basic */

/* get Titles in dirTree */
function readTitleContent(path){
  var data = fs.readFileSync(path, 'utf8');

  var titleTagStart = data.search('<title>');
  var titleTagEnd = data.search('</title>');

  if(titleTagStart <= 0){
    return '';
  }

  return data.slice(titleTagStart + 7, titleTagEnd);
}

function getTitles(srcPath, fileList){
  var titles = [];

  for(var i = 0; i < fileList.length; i++){
    titles[i] = readTitleContent(path.join(srcPath, fileList[i]));
  }

  return titles;
}
/* //get Titles in dirTree */

/* make index file object */
function makeHTML(lang, charset, title){
  var objectHTML = function(){
    var templateString = '<!DOCTYPE html>\n<html lang="' + lang + '">\n<head>\n<meta charset="' + charset + '">\n' +
                         '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n<title>' + title + '</title>\n</head>\n<body>\n</body>\n</html>\n';

    this.value = templateString;

    this.toString = function(){
      return this.value;
    };

    this.valueOf = function(){
      return this.value;
    };

    this.setBodyInnerHTML = function(innerHTML){
      var bodyReg = /<body>\s*.*\s*<\/body>/gi;
      var sBodyStartTag = '<body>\n',
          sBodyEndTag = '\n</body>';

      this.value = this.value.replace(bodyReg, sBodyStartTag + innerHTML + sBodyEndTag);
    };

    this.appendCSS = function(url){
      var headEndReg = /<\/head>/gi;
      var sBodyStartTag = '\n<body>';
      var sCSSLinkTag = '<link rel="stylesheet" href="' + url + '">\n</head>';

      this.value = this.value.replace(headEndReg, sCSSLinkTag);
    };

    this.removeCSS = function(url){
      var sCSSLinkTag = '\n<link rel="stylesheet" href="' + url + '">';

      this.value = this.value.replace(sCSSLinkTag, '');
    };

    this.appendJS = function(url){
      var bodyEndReg = /<\/body>/gi;
      var sJSScriptTag = '<script src="'+ url +'">\n</body>';

      this.value = this.value.replace(bodyEndReg, sJSScriptTag);
    };

    this.removeJS = function(url){
      var sJSScriptTag = '\n<script src="'+ url +'">';

      this.value = this.value.replace(sJSScriptTag, '');
    };
  };

  return new objectHTML(lang, charset, title);
}

/* simple list make function */
function makeListString(srcPath, fileList){
  var sHTMLList = '',
      sUlStartTag = '\t<ul>\n',
      sUlEndTag = '\t</ul>\n',
      sLiStartTag = '\t<li>\n',
      sLiEndTag = '\t</li>\n',
      tempATag = '\t\t<a href="%path">%title</a>\n';

  sHTMLList = sUlStartTag;

  var titles = getTitles(srcPath, fileList);

  for(var i = 0; i < titles.length; i++){
    var sInnerATag = tempATag;

    sHTMLList += sLiStartTag;
    sInnerATag = sInnerATag.replace('%path', path.join(srcPath, fileList[i]));
    sHTMLList += sInnerATag.replace('%title', titles[i]);
    sHTMLList += sLiEndTag;
  }

  return sHTMLList + sUlEndTag;
}

/* make index */
gulp.task('makeIndex', function(){
  var oHTML = makeHTML('ko', 'UTF-8', '인덱스');
  var simpleList = getSimpleDirTree('src/');

  oHTML.setBodyInnerHTML(makeListString('src/', simpleList));
  //oHTML.appendCSS('css/test.css');
  //oHTML.appendJS('js/test.js');

  return file('index.html', oHTML.toString(), {src: true}).pipe(gulp.dest('.'));
});

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: root,
      directory: true
    },
  })
});


// 파일 변경 감지 및 브라우저 재시작
gulp.task('watch',['browserSync','sprite','compile-sass','makeIndex'], function () {
	gulp.watch(paths.scss, ['compile-sass']);
	gulp.watch(paths.img_sp, ['sprite']);
	gulp.watch(paths.html, browserSync.reload);
	gulp.watch(paths.html, ['makeIndex']);
});


//기본 task 설정
gulp.task('default', ['watch']);