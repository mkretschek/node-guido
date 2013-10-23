
(function () {
  'use strict';

  var Color;

  /**
   * ANSI color codes for coloring terminal output.
   * @enum {string}
   */
  Color = {
    RED   : '\x1b[31m',
    BLUE  : '\x1b[34m',
    GREEN : '\x1b[32m',
    GRAY  : '\x1b[30;1m',
    YELLOW: '\x1b[33;1m',
    WHITE : '\x1b[37;1m',
    RESET : '\x1b[0m'
  };


  /** Outputs a benchmark result. */
  function printBenchmark(bench) {
    var name = bench.name,
      hz = Math.round(bench.hz),
      stats = bench.stats,
      size = stats.sample.length,
      margin = stats.rme.toFixed(2);

    console.log('  %s', name);
    console.log('  ' + Color.GRAY + '= %d ops/sec \xb1%d%% (%d runs)' + Color.RESET,
        hz, margin, size);
  }


  /** Executed when the benchmark starts. */
  function onStart() {
    console.log(this.name);
  }


  /** Outputs benchmark suite's results. */
  function onComplete() {
    this.forEach(printBenchmark);
    console.log('  Fastest: ' + Color.GREEN + '%s' + Color.RESET,
        this.filter('fastest').pluck('name'));
    console.log('');
  }

  module.exports = {
    print : printBenchmark,
    onStart : onStart,
    onComplete : onComplete,
    Color : Color
  };
})();
