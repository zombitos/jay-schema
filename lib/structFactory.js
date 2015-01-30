'use strict';

//--------------
//VARS
//--------------

var _ = require('underscore');
var when = require('when');
var typeValidator = require('./typeValidator');

module.exports = function(schema, requiredErrorFormatter, typeErrorFormatter) {

  var defaultErrorFormatter = function defaultErrorFormatter(x) {
    return x;
  };
  if (typeof requiredErrorFormatter === 'undefined') {
    requiredErrorFormatter = defaultErrorFormatter;
  }
  if (typeof typeErrorFormatter === 'undefined') {
    typeErrorFormatter = defaultErrorFormatter;
  }

  return function(obj, extension, options) {
    var struct = {},
      promises = [],
      promise,
      required = [],
      i, n, temp;

    options = options || {};
    if (typeof options.omitUndefined === 'undefined') {
      options.omitUndefined = false;
    }

    _.extend(obj, extension || {});

    //Struct Formation
    schema.eachPath(function(value, key) {
      if (typeof obj[key] !== 'undefined' || !options.omitUndefined) {
        struct[key] = obj[key];
      }

      //Defaults
      if (typeof value.default !== 'undefined' &&
        typeof obj[key] === 'undefined') {
        //
        if (Object.prototype.toString.call(value.default) ===
          '[object Function]') {
          struct[key] = value.default(obj);
        } else {
          struct[key] = value.default;
        }
      }

      if (typeof value.validator !== 'undefined' &&
        Object.prototype.toString.call(value.validator) === '[object Function]' &&
        typeof struct[key] !== 'undefined') {
        struct[key] = value.validator(struct[key], obj);
      }

      //Types
      if (typeof value.type !== 'undefined' &&
        typeof struct[key] !== 'undefined') {
        struct[key] = typeValidator(struct[key], value.type);
        if (Object.prototype.toString.call(struct[key]) ===
          '[object Error]') {
          promises.push(
            when.reject(
              typeErrorFormatter(key)
            )
          );
        }
      }

      //Required
      if (value.required === true &&
        (typeof struct[key] === 'undefined' || struct[key] === '')) {
        promises.push(
          when.reject(
            requiredErrorFormatter(key)
          )
        );
      }
    });

    //Required Fields Check
    // required = schema.requiredPaths();
    // for (i = 0, n = required.length; i < n; i++) {
    //   if (typeof struct[required[i]] === 'undefined' || struct[required[i]] === '') {
    //     promises.push(
    //         when.reject(
    //           requiredErrorFormatter(required[i])
    //         )
    //       );
    //   }
    // }

    //Promise Resolution
    promise = when.settle(promises)
      .then(function(descriptors) {
        var errores = [];

        descriptors.forEach(function(d) {
          if (d.state === 'rejected') {
            // if (env === 'development') console.log('reason', d);
            errores.push(d.reason);
          }
        });

        if (errores.length) {
          return when.reject(errores);
        }

        // return
        return when.resolve(struct);
      });
    return promise;
  };
};