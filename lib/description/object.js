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


  object = function (message) {
    var ob = Object.create(object.proto);
    object.init.call(ob, message);
    return ob;
  };

  object.init = function (message) {
    description.init.call(this, message);
    this.properties__ = [];
  };


  object.proto = Object.create(description.proto);


  object.proto.has =
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

  object.proto.getValidatePropertyTasks__ = function (obj) {
    var tasks, name, len, i;

    tasks = {};

    for (i = 0, len = this.properties__.length; i < len; i += 1) {
      name = this.properties__[i];
      tasks[name] = this.getValidatePropertyTask__(obj[name], this[name]);
    }

    return tasks;
  };

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
