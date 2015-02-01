IA-Schema
===============

IA Schema is and object validation module that can be used stand alone or
as a data base schema with <a href='https://github.com/interactioncr/iamongo', target='_blank'>IA-Mongo</a>.

## Installation

  npm install ia-schema

## Basic Usage
  ```javascript
  var IASchema = require('ia-schema');
  ```
  ```javascript
  var schemaOptions = {
    requiredErrorFormatter: function(key) {
      return key + ' is required';
    },
    typeErrorFormatter: function(key) {
      return key + ' is not of correct data type';
    }
  };
  ```
  ```javascript
  var schema = {
    name: {
      required: true,
    },
    lastname: {
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: function() {
        return new Date();
      }
    },
    deletedAt: {
      type: Date,
      default: null
    }
  };
  ```
## Schema Options
  IA-Schema uses predefined functions to format errors.


  requiredErrorFormatter: 
    <br>
    Called when a required field is undefined, null, or an empty string.
    <br>
    Receives the name of the missing property.
    <br>
    Returns the error in the format you need.
    ```javascript
    var requiredErrorFormatter= function(key) {
      var err = {};
      err[key] = 'this field is required';
      return err;
    };
    ```
  <br>
  <br>
  <br>
  typeErrorFormatter: 
    <br>
    Called when a field is not of the correct data type.
    <br>
    Receives the name of the property, and the type it should be.
    <br>
    Returns the error in the format you need.
    ```javascript
    var typeErrorFormatter= function(key, type) {
      var err = {};
      err[key] = 'should be of type '+type;
      return err;
    };
    ```
## Data types
  IA-Schema supports validation for the following types:

  ```javascript
  type: Number (Accepts and transforms numbers send as strings,)
  type: String (Accepts and transform numbers to string)
  type: Date (Accepts strings, if the string is a valid date it will transform it)
  type: Boolean (Accepts strings 'true' and 'false' and transforms them)
  type: Array
  type: Object
  type: Function
  ```
  This validation will only check if the field's value is of the correct type.
  If you need a custom validation you can use the <strong>validator</strong> option.

  **Note: All data types accept null as a valid value

## Validator
  
  You can use the validator property as a function or as an enum array.
  <br>
  If the validation does not pass the function should return false, otherwise
  it should return the validated property value.

  ```javascript
  fixedSizedNumberStrong: {
    type: Number,
    validator: function(val){
      if(val < 0 && val > 9) return false;
      return val;
    }
  }
  ```
  ```javascript
  fixedSizedNumberAdjustment: {
    type: Number,
    validator: function(val){
      if(val < 0 && val > 9) val = 0;
      return val;
    }
  }
  ```
  If <strong>type</strong> is specified in the field and the validator returns
  a diferent data type the validation will fail. You can however use validator
  without specifying any data type.

  You can use other properties in a following validation.

  ```javascript
  aNumber: {
      type: Number,
      default:0
  },
  aPositiveNumber:{
    type: Number,
    validator: function(val){
      if((val - this.aNumber) < 0) return false;
      return val;
    }
  }
  ```
  IA Schema doesn't currently support async default or validator functions.

  To use validator as enum just place the array of accepted values

  ```javascript
  category: {
      type: String,
      validator:['shoes','shirts','pants']
  }
  ```
  If  the value is not in the array the validation will not pass

## Default
  You can use the default property as a constant value or as a function

  ```javascript
  aNumber: {
    type: Number,
    default: 100
  }
  ```

  ```javascript
  randomNumber: {
    type: Number,
    default: function(){
      return Math.random() * (100 - 10) + 10;
    }
  }
  ```
  If <strong>type</strong> is specified in the field and the default returns 
  a diferent data type the validation will fail. You can however use default
  without specifying any data type.

  You can use other properties in a following default.

  ```javascript
  items: {
      type: Array,
      required:true
  },
  itemsLength:{
    type: Number,
    default: function(){
      return this.items.length;
    }
  }
  ```
  IA Schema doesn't currently support async default or validator functions.


## Schema Creation
  
  Schema options:
  ```javascript
  var schemaOptions = {
    requiredErrorFormatter: function(key) {
      return key + ' is required';
    },
    typeErrorFormatter: function(key) {
      return key + ' is not of correct data type';
    }
  };
  ```
  If not options are given default error formaters return the name of the property.

  Schema fields support the following properties

    <strong>required (Boolean, default false):</strong> if true the object to validate must contain this property. Exception with omitUndefined option, see below.

    <strong>default:</strong> can be a fix value or a function that returns a value. See details above.

    <strong>validator:</strong> can be and array of valued or a function. See details above.

    <strong>type:</strong> the data type the object's property should be. See details above.

  ```javascript
  var schema = {
    name: {
      required: true,
    },
    lastname: {
      required: true
    },
    createdAt: {
      type: Date,
      required: true,
      default: function() {
        return new Date();
      }
    },
    deletedAt: {
      type: Date,
      default: null
    }
  };
  ```
  Creating new Schema:
  ```javascript
  var schema = new IASchema(schema, schemaOptions);
  ```
## Available methods

  IA Schema is promise oriented all functions starting with p the capital letter 
  will return a promise

  <strong>+path</strong>
    Fetches a copy of the schema property
    Receives:
      Property key (string)
    Returns
      Object

  <strong>+eachPath</strong>
    Iterates over each schema property, with the defined fuction
    Receives:
      Iterator (function): receives value and key
    Returns
      undefined

  <strong>+requiredPaths</strong>
    Returns an array of keys of all the schema properties thar are required
    Receives:
      None
    Returns
      Array of property names

  <strong>+pMakeStruct</strong>
    Makes struct based on the schema provided

    Receives:
      Object to validate (if it has properties that are not defined on the schema they will be ignored and not included in the result)

      Options Object:
        omitUndefined(Boolean, default false), if omit undefined is true all schema properties that are undefined in the object to validate will no subjected to validation and will be ignored in the result

      Extention Object(default empty object), object to validate will be extendend with this BEFORE it's validated, so properties should also be defined in schema and they will be validated

    Returns
      promise, see below

    ```javascript
    schema.pMakeStruct({
      name: 'Jose',
      lastname: 'Rodriguez'
    }).then(function(struct){
        //Struct will be 
        //{
          //name: 'Jose',
          //lastname: 'Rodriguez',
          //createdAt: Date Object,
          //deletedAt: null
        //}
        console.log(struct);
      },function(err){

        //Array of all validation errors
        console.log(err);
        });
    ```

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.0.1 Initial release
* 0.0.4 Fixed error delivery to string
* 0.0.5 Optimized required detection, allow use of object data in default and validator functions, improved Date type validation
* 1.0.0 
  ----If Default and validator are functions they can use "this" to reference object
  ----Validator can be an array of accepted values (enum)
  ----pMakeStruct parameters are now (data, options,extention)
  ----options omitUndefined(boolean) for pMakeStruct added
