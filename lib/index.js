var fs         = require('fs');
var path       = require('path');

var browserify = require('browserify');
var minimatch  = require('minimatch');
var log        = require('npmlog');

module.exports = plugin;

log.heading = 'metalsmith-browserify';
log.headingStyle = {
  fg: 'cyan',
  bold: true
};

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

    var included = Object.keys(files).filter(function (file) {
      return matchGlobArray(file, opts.include);
    });

    if (included.length === 0) {
      log.error('The pattern specified does not match any files');
      done();
    }

    var src = metalsmith.source();
    var dest = metalsmith.destination();

    included.forEach(function (file) {
      var b = browserify();
      var rs = b.add(src + '/' + file).bundle();

      var buffer = '';
      rs.on('data', function (chunk) {
        buffer += chunk;
      });
      rs.on('end', function () {
        files[file].contents = buffer;
        done();
      });
    });

  };
}

