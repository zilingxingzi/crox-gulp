var fs              = require('fs');
var through2        = require('through2');
var gutil           = require('gulp-util');
var assign          = require('object-assign');
var crox            = require('crox');
var helper          = require('crox/bin/helper');
var precompiler     = require('crox/lib/precompile-node').precompile;
var jsBeautify      = require('js-beautify').js_beautify;

var PluginError     = gutil.PluginError;
var outHtmlEncode   = '';
var outModulePrefix = '';

function doJsBeautify(str) {
  var opts = {
        "indent_size": 4,
        "indent_char": " ",
        "indent_level": 0,
        "indent_with_tabs": false,
        "preserve_newlines": true,
        "max_preserve_newlines": 10,
        "jslint_happy": false,
        "brace_style": "collapse",
        "keep_array_indentation": false,
        "keep_function_indentation": false,
        "space_before_conditional": true,
        "break_chained_methods": false,
        "eval_code": false,
        "unescape_strings": false
    };
    return jsBeautify(str, opts);
}

var compilers = {
  vm: crox.compileToVM,
  php: crox.compileToPhp,
  js: function(filename) {console.log('crox compile file: ', filename); return crox.compile(filename, getOptions()).toString()},
  kissy: function(filename) {console.log('crox compile file: ', filename); return helper.compileToKissy(filename, getOptions())},
  kissyfn: function(filename) {console.log('crox compile file: ', filename); return helper.compileToKissyFn(filename, getOptions())},
  cmd: function(filename) {console.log('crox compile file: ', filename); return helper.compileToCMD(filename, getOptions())},
  amd: function(filename) {console.log('crox compile file: ', filename); return helper.compileToAMD(filename, getOptions())},
  nodejs: function(filename) {console.log('crox compile file: ', filename); return helper.compileToCommonJS(filename, getOptions())}
};

compilers.commonjs = compilers.nodejs;
compilers.seajs = compilers.cmd;
compilers.requirejs = compilers.amd;
compilers.vm2 = compilers.vm;

function getOptions() {
  return {
    htmlEncode: outHtmlEncode,
    modulePrefix: outModulePrefix
  }
}

module.exports = function (options) {
  // Mixes in default options.
  var opts = assign({}, {
      target: 'js',
      modulePrefix: '',
      htmlEncode: '',
      flatten: false
    }, options);

  return through2.obj(function(file, enc, cb) {
    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb(new PluginError('crox-gulp', 'Streaming not supported'));
    }

    var str = file.contents.toString();
    var filename = file.path;
    var target = opts.target;
    var targets;
    if (target.indexOf(',') != -1) {
      targets = target.split(',');
    } else {
      targets = [target];
    }
    outHtmlEncode = opts.htmlEncode;
    outModulePrefix = opts.modulePrefix;

    targets.forEach(function(target) {
      target = target.trim();
      var compiler = compilers[target];
      var isJs = target != 'vm' && target != 'vm2' && target != 'php';
      var compiled;

      if (isJs && target != 'js') {
        if (opts.flatten) {
          // precompiler的参数是file，为了确保模块分析是在正常位置，所以只能写原文件了
          fs.writeFileSync(filename, precompiler(filename));
          // compiler的参数也是file
          compiled = compiler(filename);
          // 源文件的内容已经在precompiler之后被修改了，还需要再改回去
          fs.writeFileSync(filename, str);
        } else {
          compiled = compiler(filename);
        }
      } else {
        if (opts.flatten) {
          // 调用crox的precompiler读取文件替换之
          content = precompiler(filename);
        }
        compiled = compiler(content);
      }

      if (isJs) {
        compiled = doJsBeautify(compiled);
      }

      if (target == 'vm2') {
        compiled = compiled.replace(/#\{end\}/g, '#end');
      }

      file.contents = new Buffer(compiled);
      file.path = isJs ? (filename + '.js') : filename.replace(/\.[\w\d]+$/, '.' + (target == 'vm2' ? 'vm' : target));
      
      cb(null, file);
      
    });

  });
};