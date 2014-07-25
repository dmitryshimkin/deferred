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
            'benchmark',
            'build-dev',
            'build-prod',
            'lint',
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

  grunt.loadNpmTasks('grunt-benchmark');
  //grunt.loadNpmTasks('grunt-available-tasks');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-jscs-checker');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-wrap');

  grunt.registerTask('build-dev', [
    'concat:dev',
    'wrap:dev'
  ]);
  grunt.registerTask('build-prod', [
    'build-dev'
  ]);

  grunt.registerTask('build-test', [
    'concat:test', 'wrap:test'
  ]);

  grunt.registerTask('test', [
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

  grunt.registerTask('lint', [
    'jshint'
  ]);

  grunt.registerTask('default', [
    'build-dev'
  ]);
};
