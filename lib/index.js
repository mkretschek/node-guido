
(function () {
  'use strict';

  var format = require('util').format,
    guido;

  guido = module.exports = {
    config : require('./config'),
    validator : require('./validator'),
    validation : require('./validation'),
    description : require('./description/description'),
    // object : require('./description/object'),
    // value : require('./description/value'),
  };
  
  /**
   * Attaches methods to the target for adding validations using this
   * validator.
   *
   * @param {Object} validator Validator to be attached to the target.
   * @param {Object|Array<Object>} target Object in which the helper method
   * should be created. Accepts an array of objects. Targets are supposed to
   * be objects inheriting from {@code guido.description.proto}.
   * @return {Object} Returns the validator itself (allows chaining).
   */
  guido.attach = function (validator, target) {
    var len,
      i;

    if (Array.isArray(target)) {
      for (i = 0, len = target.length; i < len; i += 1) {
        guido.attach(target[i]);
      }
    } else {
      if (target.proto) { target = target.proto; }

      if (guido.config.DEBUG && target[validator.name]) {
        console.warn(format('guido: overriding property (%s)', validator.name));
      }

      /**
       * Adds a validation that uses this validator to the targetted
       * description.
       *
       * NOTE: this is NOT a method from the validator object. It will
       * (or should) be created on a description object (any object that
       * inherits from {@code guido.description.proto}.
       *
       * @param {...*} params Arguments that should be passed to the test
       * function (not including value and callback).
       * @param {string|function} message The message to be returned if
       * the validation fails.
       *
       * @return {Object} Description object to which the validations should
       * be appended to.
       *
       * @this {Object} The description object itself (allows chaining).
       */
      target[validator.name] = function () {
        var params = Array.prototype.slice.call(arguments),
          arity = validator.fn.length,
          msgIndex = arity - 2,
          msg = params.splice(msgIndex, 1)[0],
          vn = guido.validation(validator, params, msg);
        this.addValidation(vn);
        // allow chaining
        return this;
      };
    }
  };
})();
