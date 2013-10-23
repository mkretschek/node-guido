
/**
 * @fileoverview Defines descriptions, which are objects describing values and
 * other objects and implementing methods to validate them.
 */

(function () {
  'use strict';

  var async = require('async'),
    config = require('../config'),
    sprintf = require('sprintf-js').sprintf,
    description;


  /**
   * Creates the .not property in a description object. It refers to
   * an object that inherits from the given description, but all
   * validations added through this object will be negated.
   *
   * @param {Object} ds A description object as returned by
   * {@code guido.description}.
   */
  function createNegationObject(ds) {
    ds.not = Object.create(ds);
    ds.not.addValidation = function (vn) {
      vn.setNegate(true);
      ds.addValidation(vn);
    };
  }


  /**
   * Creates a description object.
   *
   * Description objects are a collection of validations that should
   * be used to validate a given value.
   *
   * @param {string=} message The message to be used when validations
   * fail for this description.
   *
   * @return {Object} A description object.
   */
  description = function (message) {
    if (message && typeof message !== 'string') {
      throw(new Error('guido: invalid message'));
    }

    var ds = Object.create(description.proto);
    ds.setMessage(message);
    ds.validations__ = [];

    createNegationObject(ds);

    return ds;
  };

  /** Description objects' prototype. */
  description.proto = {
    /**
     * Adds a validation to the description.
     * @param {Object} vn Validation object that should be added to the
     * description.
     */
    addValidation : function (vn) {
      // XXX: in debug mode, should we check if validation already exists in the
      // list? This could help to find unnecessary duplicates.
      this.validations__.push(vn);
    },

    /**
     * Returns a formatted message. If a message is provided, it will be
     * used, else, tries getting a message from the description itself or
     * from the validation object (if given).
     *
     * Once a message is gotten, any placeholder it contains will be
     * replaced with the value that failed the validation.
     *
     * @param {*} val The value that has been validated.
     * @param {string=} message A message. Providing this message will
     * prevent the method from getting a message from other sources.
     * @param {Object} vn A validation object. Should be the validation
     * that caused the error.
     *
     * @return {string} A validation message.
     * @private
     */
    getMessage : function (val, message, vn) {
      message = message ||
        this.message__ ||
        (vn && vn.message) ||
        config.DEFAULT_MESSAGE;

      // Checking if there are placeholders in the message before calling
      // sprintf seems to be MUCH faster for those messages that do not use
      // placeholders. Meanwhile, the check seems to have little impact on
      // those messages using them.
      return ~message.indexOf('%') ?
        sprintf(message, val) :
        message;
    },

    /**
     * Sets a generic message for this description. If a validation
     * fails, this message will be preferred over messages defined in
     * the validation and validator objects.
     *
     * @param {string=} message The message to be used in case of validation
     * errors. If set, must be a string.
     */
    setMessage : function (message) {
      this.message__ = message;
    },

    /**
     * Validates a given value. Synchronous validations are run first.
     * Asynchronous validations will be run only if all synchronous
     * validations succeed.
     *
     * @param {*} val Value to be validated.
     * @param {string} message Message to be returned in case of failure.
     * @param {function(err, valid)} callback Callback to be called
     * when all validations have been called (or an error ocurred).
     */
    validate : function (val, message, callback) {
      var self = this;

      if (!callback && typeof message === 'function') {
        callback = message;
        message = undefined;
      }

      if (!callback) {
        throw(new Error('guido: callback required for async validations'));
      }

      async.parallel(this.getValidationTasks__(val), function (err) {
        if (err) {
          if (err.validation) {
            message = self.getMessage(val, message, err.validation);
            callback(null, false, message);
          } else {
            callback(err, false, 'Unexpected error.');
          }
        } else {
          callback(null, true);
        }
      });
    },

    getValidationTasks__ : function (val) {
      var tasks,
        vn,
        len,
        i;

      tasks = [];

      for (i = 0, len = this.validations__.length; i < len; i += 1) {
        vn = this.validations__[i];
        tasks.push(this.createValidationTask__(val, vn));
      }

      return tasks;
    },

    createValidationTask__ : function (val, vn) {
      return function (done) {
        vn.validate(val, function (err, valid) {
          if (!err && !valid) {
            // Stops async.parallel()
            err = new Error('guido: validation error');
            err.validation = vn;
          }
          done(err, valid);
        });
      };
    }
  };

  module.exports = description;
})();
