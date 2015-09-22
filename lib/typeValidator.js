//Type Validator
module.exports = function typeValidator(data, type) {
  var result = new Error();
  var valideType = function valideType(type) {
    //IF DATA IS NULL IS VALID FOR ALL TYPES
    if (data === null || data === 'null') {
      result = null;
    } else {
      if (Object.prototype.toString.call(data) === type) {
        result = data;
      }
    }
  };
  type = type.name;
  type = type.toLowerCase();
  //
  switch (type) {
    case 'number':
      if (!isNaN(data) && data !== null) data = parseFloat(data);
      valideType('[object Number]');
      if (isNaN(result) && result !== null) {
        result = new Error();
      }
      break;
    case 'string':
      if (Object.prototype.toString.call(data) === '[object Number]') data = data.toString();
      valideType('[object String]');
      break;
    case 'date':
      if (Object.prototype.toString.call(data) === '[object String]') data = new Date(data);
      valideType('[object Date]');
      if (Object.prototype.toString.call(data) === '[object Date]') {
        if (isNaN(data.getTime())) {
          result = new Error();
        }
      }
      break;
    case 'boolean':
      if (typeof data === 'string') {
        data = data.toLowerCase();
        data = data === 'true' ? true : data === 'false' ? false : data;
      }
      valideType('[object Boolean]');
      break;
    case 'array':
      valideType('[object Array]');
      break;
    case 'object':
      valideType('[object Object]');
      break;
    case 'function':
      valideType('[object Function]');
      break;
    default:
      break;
  }
  return result;
}