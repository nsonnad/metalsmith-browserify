var fs         = require('fs');
var path       = require('path');

var browserify = require('browserify');
var minimatch  = require('minimatch');
var log        = require('npmlog');

module.exports = plugin;

function matchGlobArray (file, patterns) {
  return patterns.some(function (pattern) {
    return minimatch(file, pattern, { matchBase: true});
  });
}

function plugin (opts) {
  return function (files, metalsmith, done) {
    if (!opts.include) {
      log.error('You must specify a file for browserify to bundle.');
      done();
    }
    if (!opts.output) {
      log.error('You must specify an output file for browserify to bundle.');
      done();
    }
    var src = metalsmith.source();
    var dest = metalsmith.destination();

    var included = Object.keys(files).filter(function (file) {
      matchGlobArray(file, opts.include);
    });

    var srcPath = src + '/' + included;
    var destPath = dest + '/' + opts.output;
    var ws = fs.createWriteStream(destPath);

    var b = browserify(srcPath);

    if (opts.transform) {
      b.transform(opts.transform);
    }

    //if (opts.bundle) {
      //b.bundle(opts.bundle);
    //} else {
      //b.bundle();
    //}

    b.bundle().pipe(fs.createWriteStream(destPath));

    done();
  };
}

