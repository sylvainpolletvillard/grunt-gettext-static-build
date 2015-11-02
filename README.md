# grunt-gettext-static-build

> Runs i18n and template engine at grunt's compile time.

## Goal
Simple source file translation tool at grunt's compile time : any source file is translated using [node-gettext](https://github.com/andris9/node-gettext) and PO files.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install sylvainpolletvillard/grunt-gettext-static-build --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('sylvainpolletvillard/grunt-gettext-static-build');
```

## The "gettext-static-build" task
_Run this task with the `grunt` command._

Task targets, files and options may be specified according to the grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

### Overview
In your project's Gruntfile, add a section named `gettext-static-build` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  "gettext-static-build": {
    basic: {
      options: {
        // Task-specific options go here.
      },
      files: {
        // Target-specific file lists go here.
      },
    },
  },
})
```

### Options

#### dest
Type: `String`
Default value: `dist`

Specifies directory where the translated sources will be copied, creating a subdirectory for each language (eg. dist/fr/)

#### poDirectory
Type: `String`
Default value: `locales`

Specifies directory where sources PO translation data files will be read. This directory should contain translation data for each language in a file named {language}/{poFile}.po with poFile as `poFile` option value and language as language code (eg. fr/messages.po)

#### poFile
Type: `String`
Default value: `messages.po`

Name of the PO files in each language subdirectory.

#### locales
Type: `String|Array`
Default value: `[]`

Defines the list of all availables locales (ie. languages).

#### regex
Type: `RegExp`
Default value: `/tr\(['"](.+?)['"]\)/g`

Regexp to use to match labels in source files. The capturing group must return the text to translate.


### Usage Examples

#### Internationalization

This example shows how to use gettext's po translation files. The `poFile` option defines the name of files to load in the translation directory. In this example, PO files are found in `translations/fr/messages.po` for lang fr.

```js
grunt.initConfig({
  "gettext-static-build": {
    production: {
      options: {
        locales: 'locales',
        poDirectory: 'translations',
        poFile: 'messages.po',
        dest: 'dist',
        pathToRemove: 'src/',
        regex: {
          handlebars: /\{\{\s*tr\s+['"](.*?)['"]\}\}/g,
          html: /\btr\(['"](.+?)['"]\)/g,
          javascript: /\btr\((['"].+?['"])\)/g
        }
      },
      files: {
        handlebars: ['src/**.hbs'],
        html: ['src/**.html'],
        javascript: ['src/**.js'],
        assets: [
          'src/**.css',
          'src/img/**',
          'src/fonts/**'
        ]
      }
    }
  }
})
```

---


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
0.5.0 - FORK - completely changed the project to suit our project needs
0.2.1 - Add gettext for both 'mo' and 'po'.
0.2.0 - Add gettext usage.
0.1.1 - Add internationalization.
0.1.0 - Initial version.
