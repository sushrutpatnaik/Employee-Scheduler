'use strict';

const AWS = require("aws-sdk");
const DynamoDBService = require("./service/DynamoDBService");

const empTable = process.env.EMP_TABLE;

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
  let storeId = empObj.StoreId;
  let dbresponse;

  let id_generate = Date.now().toString();
  console.log(id_generate);
  

  const dbparams = {
    TableName : empTable,
    Item : {
      employeeid : id_generate,
      storeid: storeId,
      empDob: empDob,
      asignedshifts : {}
    }
  };
  
  const dbService = new DynamoDBService();
  await dbService.createRecord(dbparams).then(async (createResponse) => {
    console.log("DynamoDB Service Response:"+JSON.stringify(createResponse));
    dbresponse = createResponse;
  });
  callback(null,response(200,dbresponse));
};
