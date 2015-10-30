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

  var _ = grunt.util._;


  grunt.registerMultiTask('gettext-static-build', 'Generate subdirectories for each locale replacing gettext labels from a PO file', function() {
    var options = this.options({
      i18n: true,
      locales : [],
      directory: 'locales',
      subDir: null,
      extension: null,
      gettext: null,
      gettext_suffix: 'mo',
      data: {},
      regexp: /_\(['"](.+?)['"]\)/g,
      variable: null // Avoid underscore's template to use "with(...)"
    });
    grunt.verbose.writeflags(options, 'Options');


    if (this.files.length < 1) {
      grunt.log.warn('Destination not written because no source files were provided.');
    }

    if(options.variable){
      _.templateSettings.variable = options.variable;
    }

    // gettext
    var gt = null;

    // if i18n active
    if(options.i18n){
      if(options.locales.length < 1 || options.locales[0].length < 1) {
        grunt.log.warn('Cannot run internationalization without any locale defined.');
      }

      _.templateSettings = {
        interpolate: options.regexp
      };

      if(options.gettext){
        gt = new Gettext();
        options.locales.forEach(function(lng) {
	        var gtfile;
	        if(options.subDir){
		        gtfile = options.directory + '/' + lng + '/' + options.gettext + '.' + options.gettext_suffix;
	        } else {
		        gtfile = options.directory + '/' + options.gettext + '_' + lng + '.' + options.gettext_suffix;
	        }

          if(grunt.file.exists(gtfile) && !grunt.file.isDir(gtfile)){
            var fileContents = fs.readFileSync(gtfile);
            gt.addTextdomain(lng, fileContents);
          } else {
            grunt.log.warn('Translation file not found for language "' + lng + '" (file "' + gtfile + '").');
          }
        });
      }
    }

    var languages = (options.locales.length < 1) ? [''] : options.locales;
    var files = this.files;
    // For each language
    languages.forEach(function(lng) {
      if(options.i18n){
        if(gt){
          gt.textdomain(lng);
        }
        else {
          i18n.configure({
            locales: options.locales,
            directory: options.directory,
            defaultLocale: lng
          });
        }
      }

      // Iterate over all specified file groups.
      files.forEach(function(f) {
        // Template's execution
        var src = f.src.filter(function(filepath) {
          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source file "' + filepath + '" not found.');
            return false;
          }
          return !grunt.file.isDir(filepath);
        }).map(function(filepath) {

          return grunt.file.read(filepath).replace(options.regexp, function(match, label){
            if(gt){
              console.log("match", label, gt.gettext(label));
              return gt.gettext(label);
            } else {
              return i18n.__(label);
            }
          });
        });

        // Build destination name
        var folder = false;
        if(grunt.file.isDir(f.dest) || f.dest.charAt(f.dest.length-1) === '/'){
          folder = true; // if already an existing folder or ends with '/' :
          // force folder output
        }
        else {
          // If destination isn't a directory (ie. single file) : concatenate results
          src = src.join('\n');
        }
        if(folder){
          for(var i = 0; i < src.length; i++){
            var srcFile = f.src[i];
            var filename = f.dest;
            if(options.subDir){
              filename += lng + '/';
            }
            if(options.i18n && lng.length > 0){
              filename += getOutputName(srcFile.replace(/^.*[\\\/]/, ''), lng, options.extension, options.subDir);
            } else {
              filename += getOutputName(srcFile.replace(/^.*[\\\/]/, ''), '', options.extension, options.subDir);
            }
            // Write the destination files.
            grunt.file.write(filename, src[i]);
            grunt.log.writeln('File "' + filename + '" created.');
          }
        } else {
          var d = f.dest;
          if(options.i18n && lng.length > 0){
            d = getOutputName(f.dest, lng, options.extension);
          }
          // Write the destination file.
          grunt.file.write(d, src);
          grunt.log.writeln('File "' + d + '" created.');
        }
      });
    });
  });

  var getOutputName = function(n, lng, extension, subDir) {
    var name = n;
    var idx = n.lastIndexOf('.');
    if(idx > -1){
      name = n.slice(0, idx);
    }
    if(!subDir){
      name += '_' + lng;
    }
    if(extension || typeof extension === "string"){
      name += extension;
    } else if(idx > -1){
      name += n.slice(idx);
    }
    return name;
  };
};
