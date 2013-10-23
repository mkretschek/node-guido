
(function () {
  'use strict';

  var Benchmark = require('benchmark'),
    onStart = require('./helper').onStart,
    onComplete = require('./helper').onComplete,
    Color = require('./helper').Color,
    o1, o2, o3, o4;

  // Output what is being tested (helps when executing multiple benchmark files)
  console.log(
    Color.YELLOW +
    'Benchmarking methods to check object emptiness' +
    Color.RESET
  );


  function methodA(obj) {
    var key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)){
        return false;
      }
    }
    return true;
  }


  function methodB(obj) {
    return !Object.getOwnPropertyNames(obj).length;
  }


  o1 = {};
  o2 = {foo : 'foo', bar : 'bar', baz : 'baz'};
  o3 = new Date();
  o4 = new RegExp('^.*$');

  new Benchmark.Suite('Empty object')
    .add('methodA: check each property with #hasOwnProperty()', function () {
      methodA(o1);
    })
    .add('methodB: check .getOwnPropertyNames() length', function () {
      methodB(o1);
    })
    .on('start', onStart)
    .on('complete', onComplete)
    .run();

  new Benchmark.Suite('Non-empty objects')
    .add('methodA: check each property with #hasOwnProperty()', function () {
      methodA(o2);
    })
    .add('methodB: check .getOwnPropertyNames() length', function () {
      methodB(o2);
    })
    .on('start', onStart)
    .on('complete', onComplete)
    .run();

  new Benchmark.Suite('Non-empty objects that inherit from a non-empty prototype')
    .add('methodA: check each property with #hasOwnProperty()', function () {
      methodA(o3);
    })
    .add('methodB: check .getOwnPropertyNames() length', function () {
      methodB(o3);
    })
    .on('start', onStart)
    .on('complete', onComplete)
    .run();

  new Benchmark.Suite('Empty objects that inherit from a non-empty prototype')
    .add('methodA: check each property with #hasOwnProperty()', function () {
      methodA(o4);
    })
    .add('methodB: check .getOwnPropertyNames() length', function () {
      methodB(o4);
    })
    .on('start', onStart)
    .on('complete', onComplete)
    .run();

})();
