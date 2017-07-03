crox-gulp
==================

Crox 的 Gulp插件

## Crox任务的options说明

- `target` 翻译的目标语言，可同时翻译成多个，用 `,` 隔开。目前支持： `php` | `vm` | `nodejs`(`commonjs`) | `cmd`(`seajs`) | `amd`(`requirejs`) | `kissy` | `kissyfn`

- `modulePrefix` 根模块前缀指定，例如 `app/sub/module/b` 的 `app`（主要用于js模块的翻译）

- `htmlEncode` 翻译的js代码中的html特殊字符转义方法（主要用于js相关翻译）

- `flatten` 是否把include都打平（读取真实文件内容替换）

## Gulpfile.js Demo

```js
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
```

## 使用

- `gulp watch` 开启 `watch`，实时检测Crox模板文件改动

- `gulp crox` 执行所有匹配文件的翻译

## package.json Demo

```js
{
  "name": "test-crox-grunt",
  "dependencies": {
    "crox": "^1.4.4",
    "grunt": "~0.4.2",
    "grunt-contrib-watch": "*",
    "crox-grunt": "*"
  }
}
```
