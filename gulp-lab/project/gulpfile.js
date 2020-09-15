/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

//  import the gulp package from the node_modules/ directory
const gulp = require('gulp');
// require browser-sync package, provides a local server with live reloading
const browserSync = require('browser-sync');
// uses babel to compile browser-compatible JavaScript
const babel = require('gulp-babel');
// uglify (minify) and rename the apps JavaScript files
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const cleanCss = require('gulp-clean-css');

// define a copy function:
function copy() {
  return gulp.src([
    'app/*.html',
    'app/**/*.jpg',
    // 'app/**/*.css', // processed by processCss
    // 'app/**/*.js' // processed by processJs
  ])
  .pipe(gulp.dest('build'));
}
// define a copy task
/**
 * Gulp tasks can be defined by functions, and are exposed to gulp with the gulp.task method. Once configured, these tasks can be run from the command line using the corresponding task name.

In this example, the src/ files of our app are being "piped" to a dest/ folder (build/). This example is contrived, but is typical of the general flow of gulp tasks. In general gulp is used to read some source files, process them, and output the processed files to a new destination. Examples of actual processing methods are demonstrated in later steps.
 */
gulp.task('copy', copy);

/**
  * Similarly to the previous copy task, configuring the buildAndServe task consisted of installing a package, requiring that package in gulpfile.js, and then writing a function to use the package. However, unlike with the copy task, we specified a series of functions to run for the buildAndServe task. Using gulp.series() allows us to run tasks sequentially. In this case, the buildAndServe task actually runs the copy function, followed by serve function, effectively "building" and then serving our app.
  * 
  */
function serve() {
  return browserSync.init({
    server: 'build',
    open: false,
    port: 3000
  });
}
// buildAndServe task to run copy, processJs, and processCss before it serves
gulp.task(
  'buildAndServe',
  gulp.series(
    copy, processJs, processCss,
    gulp.parallel(serve, watch)
    // update buildAndServe to call both the serve and watch functions in parallel, rather than only calling the serve function. If configured correctly, the gulp buildAndServe command should run copy, processJs, and processCss, and then call both the serve and watch functions together
  )
);

/**
   * Similarly to the copy task, the processJs task reads some src files (only app/scripts/main.js in our simple app). In this case however, the files are piped through the babel function (defined in the required babel package). This babel function compiles the source JavaScript in our app, and then pipes the output to a dest (build/scripts/main.js).

    The babel function also accepts some configuration option (presets), which is common for gulp modules.

    uglify (minify) and rename the apps JavaScript files
  * 
  * Rather than piping the output of the babel function directly to dest, processJs now pipes the output to another function, uglify. That function pipes its own output to yet another function, rename. The output of rename is what is finally written to dest.
  */
function processJs() {
  return gulp.src('app/scripts/*.js')
  .pipe(babel({
      presets: ['env']
  }))
  .pipe(uglify())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('build/scripts'));
}
gulp.task('processJs', processJs);

// configures tasks to be automatically run when specified files change
/**
 * Here the watch method is used to "watch" all the .js files in the app/scripts/ directory (in this case, main.js) and run the processJs task anytime there are changes. This automation enables us to see changes during development without the need to re-run tasks in the command line.

Similarly to gulp.src, gulp.dest, and gulp.task, the gulp.watch method is defined in the gulp package itself, so it doesn't require importing a new package.
 */
function watch() {
  gulp.watch('app/scripts/*.js', processJs);
  //Update the watch task to run processCss whenever the CSS files in app/styles/ change.
  gulp.watch('app/styles/*.css', processCss);
}
gulp.task('watch', watch);

/**
 * Define and expose a processCss task, similar to the processJs task. This task should:

    read the source CSS files from app/styles/
    process the files with the gulp-clean-css module
    rename the files with a ".min" extension
    write the processed and renamed files to build/styles/
 */

function processCss() {
  return gulp.src('app/styles/*.css')
  .pipe(cleanCss())
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(gulp.dest('build/styles'));
}
gulp.task('processCss', processCss);
