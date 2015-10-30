/*
 * grunt-gettext-static-build
 * https://github.com/sylvainpolletvillard/grunt-gettext-static-build
 * forked from https://github.com/ErikLoubal/grunt-template-runner
 *
 * Copyright (c) 2013 Erik Loubal
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var i18n = require("i18n");
  var fs = require('fs');
  var Gettext = require("node-gettext");

  grunt.registerMultiTask('gettext-static-build', 'Generate subdirectories for each locale replacing gettext labels from a PO file', function() {
    var options = this.options({
      locales : [],
      poDirectory: 'locales',
      poFile: 'messages.po',
      filesToSkip: [],
      dest: 'dist',
      regexp: /tr\(['"](.+?)['"]\)/g
    });
    grunt.verbose.writeflags(options, 'Options');

    if (this.files.length < 1) {
      grunt.log.warn('Destination not written because no source files were provided.');
    }

    if(options.locales.length < 1 || options.locales[0].length < 1) {
      grunt.log.warn('Cannot run internationalization without any locale defined.');
    }

    var gt = new Gettext();

    options.locales.forEach(function(lng) {
      var gtfile = options.poDirectory + '/' + lng + '/' + options.poFile;
      if(grunt.file.exists(gtfile)){
        gt.addTextdomain(lng, fs.readFileSync(gtfile));
      } else {
        grunt.log.warn('Translation file not found for language "' + lng + '" (file "' + gtfile + '").');
      }
    });

    var languages = (options.locales.length < 1) ? [''] : options.locales;
    var files = this.files;
    languages.forEach(function(lng) {
      gt.textdomain(lng);

      var nbMatches = 0;

      // Iterate over all specified file groups.
      files.forEach(function(f) {

        var src = f.src.filter(function(filepath) {
          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          }
          if(grunt.file.isMatch(options.filesToSkip, filepath.replace(f.orig.cwd, ''))){
            var destpath = options.dest + '/' + lng + '/' + filepath.replace(f.orig.cwd, '');
            grunt.file.copy(filepath, destpath); //copy file without translating it
            return false;
          }
          return !grunt.file.isDir(filepath);
        }).map(function(filepath) {
          var filedata = grunt.file.read(filepath);

          return filedata.replace(options.regexp, function(match, label){
            nbMatches++;
            return gt.gettext(label);
          });
        });

        for(var i = 0; i < src.length; i++){
          var destpath = options.dest + '/' + lng + '/' + f.src[i].replace(f.orig.cwd, '');

          // Write the destination files.
          grunt.file.write(destpath, src[i]);
          grunt.log.writeln('File "' + destpath + '" created.');
        }

      });

      grunt.log.writeln(nbMatches+" labels translated for lang "+lng);
    });
  });

};
