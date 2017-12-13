'use strict'
const gulp = require('gulp-param')(require('gulp'), process.argv),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    server = require('karma').Server,
    wrap = require("gulp-wrap"),
    request = require('request'),
    fs = require('fs'),
    nuget = require('gulp-nuget');


// Concatenate & Minify JS
gulp.task('scripts', function () {
    return gulp.src(['src/request-bundler.js', 'src/*.js'])
        .pipe(concat('autocomplete.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'))
        .pipe(rename('autocomplete.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('test', ['scripts'], function (done) {
    new server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function (exitCode) {
        done();
        process.exit(exitCode);
    }).start();
});

// Watch for file changes and re-run tests on each change
gulp.task('tdd', function (done) {
    new server({
        configFile: __dirname + '/karma.conf.js'
    }, function () {
        done();
    }).start();
    return gulp.watch('src/*.js', ['scripts']);
});

gulp.task('nuget-download', function(done) {
    if(fs.existsSync('nuget.exe')) {
        return done();
    }

    request.get('http://nuget.org/nuget.exe')
        .pipe(fs.createWriteStream('nuget.exe'))
        .on('close', done);
});

gulp.task('nuget-pack', function(apikey) {
    var nugetPath = 'nuget.exe';
  
    return gulp.src('Softec.Web.Autocomplete.nuspec')
      .pipe(nuget.pack({ nuget: nugetPath, version: "1.0.0" }))
      .pipe(gulp.dest(apikey + 'project.1.0.0.nupkg'));
  });

gulp.task('deploy', ['scripts']);
gulp.task('default', ['scripts', 'test', 'nuget-download']); 
