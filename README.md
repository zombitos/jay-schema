JSchema
===============

Schema builder to validate input

## Installation

  npm install jschema

## Usage
  //Require Module
  var JSchema = require('jschema');

  //Schema Creating Options
  var schemaOptions = {
    requiredErrorFormatter: function(key) {
      return key + ' is required';
    },
    typeErrorFormatter: function(key) {
      return key + ' is not of correct data type';
    }
  };

  //Schema
  var schema = {
    name: {
      required: true,
    },
    lastname: {
      required: true
    },
    phone: {
      type: Number,
      required: false
    },
    email: {
      type: String,
      required: true,
      validator: function(val) {
        var regex = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
        if (!regex.test(val)) {
          return false;
        }
        return val;
      }
    },
    gender: {
      type: Boolean
    },
    id: {
      type: String,
      index: true
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

  //Schema Creation
  var schema = new JSchema(schema, schemaOptions);

  //Makes struct succesfully with full data
  schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: 555,
        gender: true,
        email: 'j@interaction.cr',
        createdAt: new Date(),
        deletedAt: null,
        id: '111111111'
      }).then(function(struct){
          console.log(struct);
        },function(err){
          console.log(err);
          });

  //Makes struct succesfully without default fields
  schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: 555,
        gender: true,
        email: 'j@interaction.cr',
        id: '111111111'
      }).then(function(struct){
          console.log(struct);
        },function(err){
          console.log(err);
          });

  //Makes struct succesfully converting data types where it makes sense
  schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        gender: 'false',
        email: 'j@interaction.cr',
        id: 111111111
      }).then(function(struct){
          console.log(struct);
        },function(err){
          console.log(err);
          });

  //Missing required field with required error formater
  schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        id: 111111111
      }).then(function(struct){
          console.log(struct);
        },function(err){
          console.log(err);
          });

  //Incorrect type field with type error formater
  schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        id: 111111111,
        gender: 'hola'
      }).then(function(struct){
          console.log(struct);
        },function(err){
          console.log(err);
          });

  //Field not passing due to custom validator with type error formater
  schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        email: 'not a valid email',
        id: 111111111,
        gender: 'true'
      }).then(function(struct){
          console.log(struct);
        },function(err){
          console.log(err);
          });
 

## Tests

  npm test

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style.
Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 0.0.1 Initial release