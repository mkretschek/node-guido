/**
 * @fileoverview Defines validations. Validations are objects that configure a
 * validator to be used by a description object.
 */


(function () {
  'use strict';

  var validator = require('./validator'),
    validation;

  validation = function (vr, params, message) {
    if (!validator.proto.isPrototypeOf(vr)) {
      throw(new Error('guido: invalid validator'));
    }

    if (!message &&
        (typeof params === 'string' || typeof params === 'function')) {
      message = params;
      params = undefined;
    }

    var vn = Object.create(validation.proto);

    /**
     * Validator used to test values. Should be an object that inherits
     * from {@code guido.validator.proto}.
     * @type {Object}
     */
    vn.validator = vr;

    /**
     * Additional parameters passed to the validator.
     * @type {Array|undefined}
     */
    vn.params = params;

    vn.setMessage(message);

    return vn;
  };


  validation.proto = {
    /**
     * The message to be used when validation fails. If message is a function,
     * it will receive the additional params ({@code params}) as arguments.
     * @type {string}
     */
    message : undefined,

    /**
     * Indicates if the result of the validator's test function should be
     * negated/inverted.
     * @type {boolean}
     */
    negate : false,

    /**
     * Sets the message for this validation.
     * @param {string|function=} message The message. If a function is passed,
     * it will be called imediately, receiving the validation's additional
     * params as arguments.
     * @return {Object} The validation object itself (allows chaining).
     */
    setMessage : function (message) {
      if (!message) {
        message = this.validator.message;
      }

      this.message = typeof message === 'function' ?
        message.apply(null, this.params) :
        message;
    },

    /**
     * Sets the negate flag. See {@code .negate}.
     * @param {boolean} negate If the validation result should be inverted
     * or not.
     * @return {Object} The validation object itself (allows chaining).
     */
    setNegate : function (negate) {
      this.negate = !!negate;
      return this;
    },

    /**
     * Validates a given value.
     * @param {*} val The value to be validated.
     * @param {function(err, valid)=} callback A callback function to be called
     * if the validator is asynchronous (ignored by synchronous validators).
     * @return {boolean|undefined} If the validator is synchronous, returns
     * a boolean indicating if the {@code val} is valid or not. Should return
     * {@code undefined} if async.
     */
    validate : function (val, callback) {
      var args;

      if (typeof callback !== 'function') {
        throw(new Error('guido: callback is required'));
      }

      args = [val].concat(
        this.params || [],
        this.negate ?
          function (err, valid) { callback(err, !valid); } :
          callback
      );

      validator.proto.validate.apply(this.validator, args);
    }
  };

  module.exports = validation;

})();
