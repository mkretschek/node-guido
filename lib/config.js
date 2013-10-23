/**
 * @fileoverview Configuration for the guido module.
 */

(function () {
  'use strict';

  var config;

  config = module.exports = {};

  /**
   * Turns debug mode on/off.
   * @type {bool}
   */
  config.DEBUG = false;

  /**
   * Fallback message. Used if no message could be retrieved for a validation.
   * @type {string|function}
   */
  config.DEFAULT_MESSAGE = 'Invalid.';

  /**
   * Generic message used in object validations when a property is invalid.
   * @type {string|function}
   */
  config.INVALID_PROPERTIES_MESSAGE = 'One or more properties are invalid.';
})();
