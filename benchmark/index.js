'use strict';

var suites = [
  require('./suite/instance-then-resolve')
];

suites.forEach(function (suite) {
  console.log('\n' + suite.name);
  console.log('===================================================================');

  suite.suite
    .on('cycle', function(event) {
      console.log(String(event.target));
    })
    .on('complete', function() {
      console.log('Fastest is ' + this.filter('fastest').map('name'));
    })
    .run({ 'async': false });
});
