

(function () {
  'use strict';

  var Benchmark = require('benchmark'),
    vsprintf = require('sprintf-js').vsprintf,
    onStart = require('./helper').onStart,
    onComplete = require('./helper').onComplete,
    Color = require('./helper').Color,
    Pattern;

  // Output what is being tested (helps when executing multiple benchmark files)
  console.log(Color.YELLOW + 'Benchmarking vprintf' + Color.RESET);


  function methodA(message, params) {
    return vsprintf(message, params);
  }


  function methodB(message, params) {
    if (~message.indexOf('%')) {
      return vsprintf(message, params);
    }
    return message;
  }



  new Benchmark.Suite('Message with a simple placeholder')
    .add('methodA: vsprint directly', function () {
      methodA('This message has a %s.', ['placeholder']);
    })
    .add('methodB: check for % in the message', function () {
      methodB('This message has a %s.', ['placeholder']);
    })
    .on('start', onStart)
    .on('complete', onComplete)
    .run();

  new Benchmark.Suite('Message without placeholder')
    .add('methodA: vsprintf directly', function () {
      methodA('This message has no placeholder.', ['foo']);
    })
    .add('methodB: check for % in the message', function () {
      methodB('This message has no placeholder.', ['foo']);
    })
    .on('start', onStart)
    .on('complete', onComplete)
    .run();

  new Benchmark.Suite('Message with positional placeholders.')
    .add('methodA: vsprintf directly', function () {
      methodA('This message has two placeholders: one for %2$s and another for %1$s.', ['foo', 'bar']);
    })
    .add('methodB: check for % in the message', function () {
      methodB('This message has two placeholders: one for %2$s and another for %1$s.', ['foo', 'bar']);
    })
    .on('start', onStart)
    .on('complete', onComplete)
    .run();

})();
