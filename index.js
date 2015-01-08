/* global module */
'use strict';

// -----------------------
// Deps
// -----------------------
var _ = require('underscore');
var when = require('when');
var structFactory = require('./lib/structFactory');


// -----------------------
// Class Definition
// -----------------------
module.exports = function JSchema(schema, options) {
  // -----------------------
  // Attributes
  // -----------------------
  var _schema = schema;
  var _options = options || {};
  var _requiredPaths = null;


  // -----------------------
  // Methods
  // -----------------------
  //SCOPE
  //this.path
  //this.eachPath
  //this.requiredPaths
  //this.pMakeStruct

  /**
   * path
   * Returns an object of the Schema
   * key<String>: path name to get from schema
   * returns: <Object>
   */
  this.path = function path(key) {
    return _.clone(_schema[key]);
  };

  /**
  * eachPath
  * Executes a function for each object of the Schema
  * interator<function>: 
  ---function to execute for eachPath
  ---iterator receives value and key
  * returns: <undefined>
  */
  this.eachPath = function eachPath(iterator) {
    _.each(_schema, iterator);
  };

  /**
   * requiredPaths
   * Returns the keys of all required objects in Schema
   * returns: <Array>
   */
  this.requiredPaths = function requiredPaths() {
    var paths = [];
    if (_requiredPaths === null) {
      _requiredPaths = [];
      this.eachPath(function(val, key) {
        if (val.required === true) {
          _requiredPaths.push(key);
        }
      });
    }
    paths = _requiredPaths;
    return paths;
  };



  /**
   * pMakeStruct
   * Makes the struct of the defined Schema
   * returns: <Promise>
   ---Success returns data object
   ---Fail returns error (may be formated or be just key string) 
   */
  this.pMakeStruct = function pMakeStruct(data, extention, options) {
    return structFactory(
      this,
      _options.requiredErrorFormatter,
      _options.typeErrorFormatter)(data, extention, options);
  };
};