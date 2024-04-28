'use strict';

const AWS = require("aws-sdk");
const DynamoDBService = require("./service/DynamoDBService");

const empTable = process.env.EMP_TABLE;
const shiftTable = process.env.SHIFT_TABLE;

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
  let empDept = empObj.Dept;
  let empRole = empObj.Role;
  let dbresponse;
  let itemCount;


  const params = {
    TableName: empTable,
    Select: "COUNT",
  };

  const dbService = new DynamoDBService();

  await dbService.getItemCount(params).then(async (getCountResponse) => {
    console.log("Employee Table Count Response:"+JSON.stringify(getCountResponse));
    itemCount = getCountResponse.Count;
  });

  let employeeId = (itemCount+1).toString().padStart(4, '0');
  console.log("Employee ID is ",employeeId);
  

  const dbparams = {
    TableName : empTable,
    Item : {
      employeeid : employeeId,
      empname: empName,
      empdob: empDob,
      empdept: empDept,
      emprole: empRole,
      asignedshifts : []
    }
  };
  
  
  await dbService.createRecord(dbparams).then(async (createResponse) => {
    console.log("Employee Table Service Response:"+JSON.stringify(createResponse));
    dbresponse = createResponse;
  });
  callback(null,response(200,dbresponse));
};


module.exports.updateEmployee = async (event,context,callback) => {
 
  let empObj = JSON.parse(event.body);
  let employeeId = event.pathParameters['id'];
  let empRole = empObj.Role;
  let empDept = empObj.Dept;
  let dbresponse;

  
  console.log("Employee ID is ",employeeId);

  const dbparams = {
    TableName : empTable,
    Key: {
      employeeid: employeeId
    },
    UpdateExpression: 'set emprole = :newRole, empdept = :newDept',
    ExpressionAttributeValues: {
      ':newRole': empRole,
      ':newDept': empDept
    },
    ReturnValues: 'UPDATED_NEW'
  };
  
  const dbService = new DynamoDBService();
  await dbService.updateRecord(dbparams).then(async (updateResponse) => {
    console.log("DynamoDB Service Response:"+JSON.stringify(updateResponse));
    dbresponse = updateResponse;
  });
  callback(null,response(200,dbresponse));
};

module.exports.createShift = async (event,context,callback) => {
 
  let shiftObj = JSON.parse(event.body);

  let startTime = shiftObj.StartTime
  let endTime = shiftObj.EndTime
  let dbresponse;

  let shift_id_generate = Date.now().toString();
  console.log(shift_id_generate);
  

  const dbparams = {
    TableName : shiftTable,
    Item : {
      shiftid : shift_id_generate,
      starttime: startTime,
      endtime: endTime
    }
  };
  
  const dbService = new DynamoDBService();
  await dbService.createRecord(dbparams).then(async (createResponse) => {
    console.log("Shift Table Service Response:"+JSON.stringify(createResponse));
    dbresponse = createResponse;
  });
  callback(null,response(200,dbresponse));
};


module.exports.getShifts = async (event,context,callback) => {
 
  let startTime = event.queryStringParameters['start'];
  let endTime = event.queryStringParameters['end'];
  console.log("Start time is ",startTime);
  console.log("End time is ",endTime);
  let dbresponse = startTime;

  callback(null,response(200,dbresponse));
};