module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    clean: {
      test: ['build/deferred.test.js']
    },

    concat: {
      dev: {
        files: {
          'build/deferred.js': [
            'src/Promise.js',
            'src/Deferred.js',
            'src/when.js',
            'src/export.js'
          ]
        }
      },
      test: {
        files: {
          'build/deferred.test.js': [
            'src/Promise.js',
            'src/Deferred.js',
            'src/when.js'
          ]
        }
      }
    },

    jasmine: {
      dev: {
        src: 'build/deferred.test.js',
        options: {
          specs: 'test/spec/Deferred.spec.js',
          template: require('grunt-template-jasmine-istanbul'),
          outfile: 'test.html',
          keepRunner: true,
          templateOptions: {
            coverage: 'test/report/coverage.json',
            report: [
              {
                type: 'html',
                options: {
                  dir: 'test/report/html'
                }
              }
            ]
          }
        }
      },
      prod: {
        src: 'build/deferred.min.js',
        options: {
          specs: [
            'test/specs/deferred.spec.js',
            'test/specs/promise.spec.js'
          ],
          template: require('grunt-template-jasmine-istanbul'),
          templateOptions: {
            coverage: 'test/report/coverage.json',
            report: [
              {
                type: 'html',
                options: {
                  dir: 'test/report/html'
                }
              }
            ]
          }
        }
      }
    },

    jshint: {
      all: [
        'Gruntfile.js',
        'build/deferred.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    watch: {
      dev: {
        files: [
          'Gruntfile.js',
          'src/**/*.js',
          'src/*.js'
        ],
        tasks: ['default']
      }
    },

    wrap: {
      dev: {
        src: ['build/deferred.js'],
        dest: '',
        options: {
          indent: '  ',
          wrapper: [
            ';(function (undefined) {\n  \'use strict\';',
            '}());\n'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-wrap');

  grunt.registerTask('build-dev', ['concat:dev', 'wrap:dev']);
  grunt.registerTask('build-test', ['concat:test', 'wrap']);
  grunt.registerTask('build-prod', ['build-dev']);
  grunt.registerTask('test-dev', ['build-test', 'jasmine:dev']);
  grunt.registerTask('test-prod', ['build-prod', 'jasmine:prod']);

  grunt.registerTask('test', ['test-dev']);
  grunt.registerTask('prod', ['build-prod']);
  grunt.registerTask('hint', ['build-dev', 'jshint']);
  grunt.registerTask('default', ['build-dev']);
};