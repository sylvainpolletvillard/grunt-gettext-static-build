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
      pathToRemove: null,
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
    var fileTypes = this.files;

    if(fileTypes.length === 0){
      grunt.log.warn("No files to translate found. Check the paths in task configuration");
    }

    languages.forEach(function(lng) {
      gt.textdomain(lng);

      var nbMatches = 0;

      // Iterate over all specified file groups.
      fileTypes.forEach(function(f) {

        var src = f.src.filter(function(filepath) {

          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          }

          if(grunt.file.isDir(filepath)){
            return false;
          }

          if(f.dest in options.regex === false){ //copy file without translating it
            var destpath = options.dest + '/' + lng + '/' + filepath.replace(options.pathToRemove, '');
            grunt.file.copy(filepath, destpath);
            return false;
          }

          return true;
        }).map(function(filepath) {
          var filedata = grunt.file.read(filepath);

          return filedata.replace(options.regex[f.dest], function(match, label){
            nbMatches++;
            if (label.charAt(0) === '"' || label.charAt(0) === "'"){
              return label[0] +  gt.gettext(label.substr(1, label.length - 2)) + label[label.length - 1]; // remove surounding quotes if any
            }
            return gt.gettext(label);
          });
        });

        for(var i = 0; i < src.length; i++){
          var destpath = options.dest + '/' + lng + '/' + f.src[i].replace(options.pathToRemove, '');

          // Write the destination files.
          grunt.file.write(destpath, src[i]);
          grunt.log.writeln('File "' + destpath + '" created.');
        }

      });

      grunt.log.writeln(nbMatches+" labels translated for lang "+lng);
    });
  });

};
