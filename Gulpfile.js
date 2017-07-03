const gulp     = require('gulp');
const watch    = require('gulp-watch');
const crox     = require('./');
const srcDir   = './test/';

const croxFn = function() {
    return crox({
        target: 'nodejs',
        modulePrefix: 'app',
        htmlEncode: 'myHtmlEncode',
        flatten: true
    });
}

gulp.task('crox', () => {
    return gulp.src([srcDir + '**/*.tpl'])
        .pipe(croxFn())
        .pipe(gulp.dest(srcDir))
});

gulp.task('default', ['crox']);

gulp.task('watch', () => {
    return watch(srcDir + '**/*.tpl', ['crox'],  (e) => {
        console.log('编译tpl模板：' + e.path);
        return gulp.src(e.path)
            .pipe(croxFn())
            .pipe(gulp.dest(srcDir))
    })
});