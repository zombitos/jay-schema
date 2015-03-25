/* global describe, it, before */
'use strict';



/* global describe, it, before */
'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var JSchema = require('../index');
var schema = null;
var goodSchema = {
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true
  },
  continent: {
    type: String,
    validator: ['america', 'europe', 'africa', 'asia', 'oceania', 'antartica']
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
    type: Boolean,
    default: true
  },
  genderString: {
    type: String,
    default: function() {
      if (this.gender === true) {
        return 'female';
      } else {
        return 'male';
      }
    },
    validator: ['female', 'male']
  },
  categories: {
    type: Array,
    validator: ['a', 'b', 'c']
  },
  id: {
    type: String
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
var schemaOptions = {
  requiredErrorFormatter: function(key) {
    return key + ' is required';
  },
  typeErrorFormatter: function(key) {
    return key + ' is not of correct data type';
  }
}


chai.use(chaiAsPromised);
chai.should();

describe('Failed Struct Tests, No Schema Options', function() {
  before(function(done) {
    schema = new JSchema(goodSchema);
    done();
  });
  it('Missing required field no required error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        id: 111111111
      })
      .should.be.rejectedWith('email')
      .notify(done);
  });
  it('Field not passing due to custom validator no type error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        email: 'j@interaction',
        id: 111111111,
        gender: 'false'
      })
      .should.be.rejectedWith('email')
      .notify(done);
  });
  it('Field not passing due to custom validator as array no type error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        email: 'j@interaction.cr',
        id: 111111111,
        gender: 'false',
        continent: 'north america'
      })
      .should.be.rejectedWith('continent')
      .notify(done);
  });
  it('Incorrect type field no type error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        email: 'j@interaction.cr',
        id: 111111111,
        gender: 'hola'
      })
      .should.be.rejectedWith('gender')
      .notify(done);
  });
  it('Incorrect type field no type error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        email: 'j@interaction.cr',
        id: 111111111,
        gender: 'false',
        categories: ['r']
      })
      .should.be.rejectedWith('categories')
      .notify(done);
  });
});

describe('Failed Struct Tests, with Schema Options', function() {
  before(function(done) {
    schema = new JSchema(goodSchema, schemaOptions);
    done();
  });
  it('Missing required field with required error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        id: 111111111
      })
      .should.be.rejectedWith('email is required')
      .notify(done);
  });
  it('Field not passing due to custom validator with type error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        email: 'j@interaction',
        id: 111111111,
        gender: 'true'
      })
      .should.be.rejectedWith('email is not of correct data type')
      .notify(done);
  });
  it('Field not passing due to custom validator as array with type error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        email: 'j@interaction.cr',
        id: 111111111,
        gender: 'true',
        continent: 'south america'
      })
      .should.be.rejectedWith('continent is not of correct data type')
      .notify(done);
  });
  it('Incorrect type field with type error formater', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        id: 111111111,
        gender: 'hola'
      })
      .should.be.rejectedWith('gender is not of correct data type')
      .notify(done);
  });
});

describe('Creating Structs Succesfully', function() {
  before(function(done) {
    schema = new JSchema(goodSchema, schemaOptions);
    done();
  });
  it('makes struct succesfully with full data', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: 555,
        gender: false,
        continent: 'america',
        genderString: 'male',
        email: 'j@interaction.cr',
        createdAt: new Date(),
        deletedAt: null,
        categories: ['a'],
        id: '111111111'
      })
      .should.eventually.be.a('object')
      .and.have.property('email', 'j@interaction.cr')
      .notify(done);
  });
  it('makes struct succesfully without default fields', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: 555,
        gender: false,
        email: 'j@interaction.cr',
        id: '111111111'
      })
      .should.eventually.be.a('object')
      .and.have.property('createdAt')
      .and.be.a('date')
      .notify(done);
  });
  it('makes struct succesfully without default fields using this in function', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: 555,
        gender: false,
        email: 'j@interaction.cr',
        id: '111111111'
      })
      .should.eventually.be.a('object')
      .and.have.property('genderString', 'male')
      .notify(done);
  });
  it('makes struct succesfully converting data types where it makes sense', function(done) {
    schema.pMakeStruct({
        name: 'Jose',
        lastname: 'Rodriguez',
        phone: '555',
        gender: 'false',
        email: 'j@interaction.cr',
        id: 111111111
      })
      .should.eventually.be.a('object')
      .and.have.property('gender')
      .and.be.a('boolean')
      .notify(done);
  });
  it('makes struct succesfully with omitUndefined option', function(done) {
    schema.pMakeStruct({
        name: 'Jose Pablo',
        lastname: 'Rodriguez Masis'
      }, {
        omitUndefined: true
      })
      .should.eventually.be.a('object')
      .and.have.property('name', 'Jose Pablo')
      .notify(done);
  });
});