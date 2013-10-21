/**
 * @fileoverview Defines the .validator() method and the Validator class,
 * used to define validators.
 */
(function () {
  'use strict';

  var isEmpty = require('./helper').isEmpty,
    validator;
    

  validator = function (name, message, fn) {
    if (!name) {
      throw(new Error('guido: name is required'));
    }

    if (!fn) {
      if (typeof message === 'function') {
        fn = message;
        message = undefined;
      } else {
        throw(new Error('guido: fn is required'));
      }
    }

    var vr = Object.create(validator.proto);
    vr.name = name;
    vr.fn = fn;
    vr.setMessage(message);

    return vr;
  };


  validator.proto = {
    /**
     * Tells if the validator allows empty values to pass the test. This makes
     * validators play nice with the "empty" validator. Defaults to true.
     * @type {boolean}
     */
    allowsEmpty : true,

    /**
     * Sets the value of the {@code allowsEmpty} flag.
     *
     * @param {boolean} allows Boolean indicating if this validator allows
     * empty values or not. Setting it to true, makes the validator play nice
     * with the {@code empty()} validator.
     *
     * @return {Object} The validator itself (allows chaining).
     */
    setAllowsEmpty : function (allows) {
      this.allowsEmpty = !!allows;
      return this;
    },

    /**
     * Sets the message returned by the validator when validation fails.
     *
     * @param {string|function|undefined} message This validator's message.
     * See {@code .message}.
     *
     * @return {Object} The validator itself (allows chaining).
     */
    setMessage : function (message) {
      /**
       * The message returned by the validator if a value is not valid. Can be
       * either a string or a function. If the test function uses additional
       * arguments (any argument other than the value and callback), these
       * additional arguments will be passed to the message function.
       * @type {string|function(...*)=}
       */
      this.message = message;
      return this;
    },

    /**
     * Checks if a given value is valid or not.
     *
     * @param {*} val Value to be validated.
     * @param {...*} params Additional arguments passed to the test function.
     * @param {callback=} callback Callback to be called when the test
     * function is done.
     */
    validate : function () {
      var arity = this.fn.length,
        val = arguments[0],
        callback;

      while (arity > arguments.length) {
        Array.prototype.splice.call(arguments, -1, 0, undefined);
      }

      callback = arguments[arity - 1];

      if (typeof callback !== 'function') {
        throw(new Error('guido: callback is required'));
      }

      if (this.allowsEmpty && isEmpty(val)) {
        callback(null, true);
      } else {
        this.fn.apply(null, arguments);
      }
    }
  };

  module.exports =  validator;
})();
