'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync');
const postcss = require('gulp-postcss');
const processInline = require('gulp-process-inline');
const inlineSource = require('gulp-inline-source');
const htmlmin = require('gulp-htmlmin');
const eslint = require('gulp-eslint');
const autoprefixer = require('autoprefixer');
const minify = require('gulp-htmlmin');
const argv = require('yargs').argv;
const gulpif = require('gulp-if');
const prettify = require('gulp-html-prettify');

gulp.task('build', () => {
  const styles = processInline();
  const scripts = processInline();
  const noMinify = argv.minify === false;

  return gulp.src(['src/*.html'])
    .pipe(inlineSource({
      compress: false,
      swallowErrors: true
    }))

    // JS
    .pipe(scripts.extract('script'))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(scripts.restore())

    // HTML
    .pipe(gulpif(!noMinify, minify({
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
      conservativeCollapse: true,
      caseSensitive: true,
      keepClosingSlash: true,
      customAttrAssign: [/\$=/],
      minifyCSS: true,
      minifyJS: true
    })))

    .pipe(gulpif(noMinify, prettify({
      indent_char: ' ',
      indent_size: 2
    })))

    .pipe(gulp.dest('.'));
});

gulp.task('browserSync', () => {
  browserSync({
    server: {
      baseDir: './',
      index: 'index.html',
      routes: {
        '/': './bower_components'
      }
    },
    open: false,
    notify: false,
    ghostMode: false
  });
});

gulp.task('watch', () => {
  gulp.watch(['src/**/*', 'demo/**/*', 'test/**/*'], ['build', browserSync.reload]);
});

gulp.task('default', ['build', 'browserSync', 'watch']);
