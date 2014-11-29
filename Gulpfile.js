var gulp = require('gulp');
var util = require('gulp-util');
var watchify = require('watchify');
var browserify = require('browserify');
var es6ify = require('es6ify');
var source = require('vinyl-source-stream');
var notifier = require('node-notifier');

gulp.task('watch', function () {
    var bundler = watchify(browserify('./lib/Graph.js', watchify.args))
        .on('update', function () { util.log('Rebundling...'); })
        .on('time', function (time) {
            util.log('Rebundled in:', util.colors.cyan(time + 'ms'));
        });

    bundler.transform(es6ify);
    bundler.on('update', rebundle);

    function rebundle() {
        return bundler.bundle()
            .on('error', function (err) {
                util.log(err);
                notifier.notify({ title: 'Browserify Error', message: 'Something went wrong.' });
            })
            .pipe(source('dist.js'))
            .pipe(gulp.dest('./dist'));
    }

    return rebundle();
});

gulp.task('default', ['watch']);