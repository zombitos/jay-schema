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

  return function(obj, options, extension) {

    var struct = {},
      promises = [],
      promise,
      required = [],
      i, n, temp;

    options = options || {};
    if (typeof options.omitUndefined === 'undefined') {
      options.omitUndefined = false;
    }

    if (Object.prototype.toString.call(obj) !== '[object Object]') {
      return when.promise(function(resolve, reject) {
        return reject('Data to struct is not a valid Object');
      });
    }

    _.extend(obj, extension || {});

    //Struct Formation
    schema.eachPath(function(value, key) {
      struct[key] = obj[key];
      if (typeof struct[key] === 'undefined' && options.omitUndefined === true) {
        delete struct[key];
      } else {
        //DEFAULT AS VALUE AND FUNCTION
        if (typeof value.default !== 'undefined' &&
          typeof struct[key] === 'undefined') {
          //
          if (Object.prototype.toString.call(value.default) ===
            '[object Function]') {
            struct[key] = value.default.call(struct);
          } else {
            struct[key] = value.default;
          }
        }

        //VALIDOTOR AS FUNCTION
        if (typeof value.validator !== 'undefined' &&
          Object.prototype.toString.call(value.validator) === '[object Function]' &&
          typeof struct[key] !== 'undefined') {
          struct[key] = value.validator.call(struct, struct[key]);
        }

        //VALIDOTOR AS ENUM
        if (typeof value.validator !== 'undefined' &&
          Object.prototype.toString.call(value.validator) === '[object Array]' &&
          typeof struct[key] !== 'undefined') {
          var found = false;
          for (var i = 0, n = value.validator.length; i < n; i++) {
            if (struct[key] === value.validator[i]) {
              found = true;
            }
          }
          if (!found) {
            struct[key] = found;
          }
        }

        //CHECKING TYPE
        if (typeof value.type !== 'undefined' &&
          typeof struct[key] !== 'undefined') {
          struct[key] = typeValidator(struct[key], value.type);
          if (Object.prototype.toString.call(struct[key]) ===
            '[object Error]') {
            promises.push(
              when.reject(
                typeErrorFormatter(key, value.type.name)
              )
            );
          }
        }

        //CHECKING REQUIRED
        if (value.required === true &&
          (typeof struct[key] === 'undefined' || struct[key] === '' || struct[key] === null)) {
          promises.push(
            when.reject(
              requiredErrorFormatter(key)
            )
          );
        }
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