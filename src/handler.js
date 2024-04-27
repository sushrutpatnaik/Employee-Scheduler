'use strict';


function response(statusCode, message) {
  return {
    isBase64Encoded: false,
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(message)
  };
}

module.exports.addEmployee = async (event,context,callback) => {
 
  let empObj = JSON.parse(event.body);
  let empName = empObj.Name;
  let empDob = empObj.DOB;
  console.log(empDob);
  callback(null,response(200,empName));
};
