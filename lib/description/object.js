/**
 * @fileoverview Defines guido.object, a function for creating descriptors
 * for whole objects and its properties.
 */

(function () {
  'use strict';

  var async = require('async'),
    config = require('../config'),
    format = require('util').format,
    description = require('./description'),
    object;


  /**
   * Creates an object description object. Object descriptions describe
   * javascript objects, allowing to define validations for the object itself
   * aswell as describing its properties and easily validate the whole object.
   * 
   * @param {string=} message The message used if the validation fails.
   * @return {Object} Object description.
   */
  object = function (message) {
    var ob = Object.create(object.proto);
    object.init.call(ob, message);
    return ob;
  };

  /**
   * Initializes the object description.
   * Should be called using {@code object.init.call()}.
   *
   * @param {string=} message The message used if the validation fails.
   * @this {Object} Description object being initialized.
   */
  object.init = function (message) {
    description.init.call(this, message);
    this.properties__ = [];
  };


  /**
   * Prototype for object descriptions.
   */
  object.proto = Object.create(description.proto);


  /**
   * Adds a property to the description.
   * @param {string} name Property name.
   * @param {string|Object=} msgOrDs If set, can be either a message string
   * or a description object. If undefined or a string, a new description
   * object will be created using {@code guido.description()}. If an object
   * is given, it will be used as the description for the property being added.
   *
   * @return {Object} Property's description object. It's important to keep
   * in mind that this method does NOT returns the object's description, but the
   * property's.
   */
  object.proto.addProperty = function (name, msgOrDs) {
    var msg, ds;

    if (description.proto.isPrototypeOf(msgOrDs)) {
      ds = msgOrDs;
    } else {
      msg = msgOrDs;
    }

    if (!ds) {
      ds = description(msg);
    }

    // Protect API properties and methods from being overriden by a
    // property description.
    if (this[name] && !description.proto.isPrototypeOf(this[name])) {
      throw(new Error(format('guido: overriding API (%s)', name)));
    }

    // Warn property overrides in debug mode
    if (config.DEBUG && ~this.properties__.indexOf(name)) {
      console.warn(format('guido: overriding description (%s)', name));
    }
    
    // Keep track of which properties are sub-descriptions.
    this.properties__.push(name);
    this[name] = ds;
    return ds;
  };

  /**
   * Alias for {@code object.proto.addProperty}.
   */
  object.proto.has = object.proto.addProperty;

  /**
   * Validates a given object.
   * @param {Object} obj Object to be validated.
   * @param {string=} message Message to be used if the validation fails.
   * @param {function(err, valid, msg, propertiesMsgs)} callback Function to
   * be called when validation finishes.
   */
  object.proto.validate = function (obj, message, callback) {
    var self = this,
      tasks;

    if (!callback && typeof message === 'function') {
      callback = message;
      message = undefined;
    }

    if (!callback) {
      throw(new Error('guido: callback is required'));
    }

    tasks = {
      properties: function (done) {
        async.parallel(
          self.getValidatePropertyTasks__(obj),
          done
        );
      },

      self : function (done) {
        description.proto.validate.call(self, obj, function (err, valid, msg) {
          if (err) {
            done(err, 'Unexpected error');
          } else if (!valid) {
            err = new Error('guido: validation failed');
            // Flag that the error commes form the object itself, not from a
            // property description.
            err.self = true;
            done(err, msg);
          } else {
            done(null);
          }
        });
      }
    };

    async.series(tasks, function (err, result) {
      if (err) {
        if (err.self === undefined) {
          callback(err, false, 'Unexpected error.');
        } else if (err.self) {
          callback(null, false, message || result.self);
        } else {
          callback(null, false,
            message || config.INVALID_PROPERTY_MESSAGE,
            result.properties);
        }
      } else {
        callback(null, true);
      }
    });
  };

  
  /* The following 2 methods are used in different parts of the validation
   * process and have very similar names. Although the names make sense,
   * they require some extra atention to see which method is being called.
   *
   * The methods are:
   *
   * #getValidatePropertyTasks__() : gets a set of tasks for validating each
   *   property in the object;
   *
   * #getValidatePropertyTask__() : gets an individual task for a specific
   *   property;
   *
   * TODO: change these names if a better naming pattern arrises.
   */

  /**
   * Gets an object mapping tasks for the {@code async.parallel} function.
   * @param {Object} obj Object to validate.
   * @return {Object} A map of tasks as expected by {@code async.parallel}.
   * @private
   */
  object.proto.getValidatePropertyTasks__ = function (obj) {
    var tasks, name, len, i;

    tasks = {};

    for (i = 0, len = this.properties__.length; i < len; i += 1) {
      name = this.properties__[i];
      tasks[name] = this.getValidatePropertyTask__(obj[name], this[name]);
    }

    return tasks;
  };

  /**
   * Gets a task function as expected by {@code async.parallel} that validates
   * a given property.
   * @param {*} val Value to be validated.
   * @param {Object} property Property description object.
   * @private
   */
  object.proto.getValidatePropertyTask__ = function (val, property) {
    return function (done) {
      property.validate(val, function (err, valid, msg) {
        if (err) {
          done(err, 'Unexpected error');
        } else if (!valid) {
          err = new Error('guido: validation failed');
          // Flag that the error commes from a property description, not
          // directly from the object description itself.
          err.self = false;
          done(err, msg);
        } else {
          done(null);
        }
      });
    };
  };

  module.exports = object;
})();
