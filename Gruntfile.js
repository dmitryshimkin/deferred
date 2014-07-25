module.exports = function (grunt) {
  'use strict';

  var source = [
    'src/Promise.js',
    'src/Deferred.js',
    'src/all.js',
    'src/any.js',
    'src/when.js',
    'src/export.js'
  ];

  grunt.initConfig({
    availabletasks: {
      tasks: {
        options: {
          filter: 'include',
          tasks: [
            'build-dev',
            'build-prod',
            'lint',
            'perf',
            'test'
          ]
        }
      }
    },

    benchmark: {
      all: {
        src: [
          'test/benchmark/suite/instantiate.js',
          'test/benchmark/suite/then.js'
          //'test/benchmark/suite/then-resolve.js'
        ],
        dest: 'test/benchmark/results.csv'
      }
    },

    concat: {
      dev: {
        files: {
          'build/deferred.js': source
        }
      }
    },

    jasmine: {
      dev: {
        src: 'build/deferred.js',
        options: {
          specs: [
            'test/spec/Deferred.spec.js'
            //'test/spec/all.spec.js',
            //'test/spec/any.spec.js'
          ],
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
            'test/spec/Deferred.spec.js'
            //'test/spec/all.spec.js',
            //'test/spec/any.spec.js'
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

    jscs: {
      all: {
        options: require('./.jscs.json'),
        files: {
          src: [
            'Gruntfile.js',
            'src/**'
          ]
        }
      }
    },

    jshint: {
      all: [
        'Gruntfile.js',
        'src/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    replace: {
      dev: {
        src: ['build/deferred.js'],
        overwrite: true,
        replacements: [
          {
            from: '\'use strict\';\n\n',
            to: ''
          },
          {
            from: /\/\* jshint \S+:\S+ \*\/\n/g,
            to: ''
          }
        ]
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
            ';(function (undefined) {\n  \'use strict\';\n',
            '}());\n'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-available-tasks');
  grunt.loadNpmTasks('grunt-benchmark');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jscs-checker');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-wrap');

  grunt.registerTask('build-dev', 'Create development build', [
    'concat:dev',
    'replace:dev',
    'wrap:dev'
  ]);

  grunt.registerTask('build-prod', 'Create production build', [
    'build-dev'
  ]);

  grunt.registerTask('test', 'Run tests with code coverage using jasmine and istanbul', [
    'test-prod',
    'test-dev'
  ]);

  grunt.registerTask('test-dev', [
    'build-dev',
    'jasmine:dev'
  ]);

  grunt.registerTask('test-prod', [
    'build-prod',
    'jasmine:prod'
  ]);

  grunt.registerTask('perf', 'Run benchmark', [
    'build-prod',
    'benchmark'
  ]);

  grunt.registerTask('lint', 'Lint source files using jscs and jshint', [
    'jshint'
  ]);

  grunt.registerTask('default', [
    'availabletasks'
  ]);
};
