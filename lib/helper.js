/**
 * @fileoverview Helper utilities.
 */

(function () {
  'use strict';

  var helper;

  helper = module.exports = {};

  helper.isEmpty = function (val) {
    if (typeof val === 'number' || typeof val === 'boolean') {
      return false;
    }

    if (typeof val === 'undefined' || val === null || val === '') {
      return true;
    }

    if (typeof val.length !== 'undefined') {
      return !val.length;
    }

    if (typeof val === 'object') {
      // Tryed to use `!Object.getOwnPropertyNames(val).length` but it seems
      // to be MUCH slower. See bench/object_emptiness.bench.js
      var key;
      for (key in val) {
        if (val.hasOwnProperty(key)) {
          return false;
        }
      }
    }

    return false;
  };
})();
