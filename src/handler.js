'use strict';

const AWS = require("aws-sdk");
const DynamoDBService = require("./service/DynamoDBService");

const empTable = process.env.EMP_TABLE;
const shiftTable = process.env.SHIFT_TABLE;


function availabilityCheck(shift,availability){
  let shift_start = shift.starttime;
  let shift_end = shift.endtime;
  let isAvailable=false;
  availability.forEach(shift=>{
    if(shift.starttime<=shift_start && shift.endtime >= shift_end){
      isAvailable = true
    }
  });
  return isAvailable;
}


function checkIntervalOverlap(start1, end1, start2, end2) {
  return !(end1 < start2 || end2 < start1);
}

function checkConflicts(shiftResponse, getEmpResponse){

  let shift_start = shiftResponse.starttime;
  let shift_end = shiftResponse.endtime;
  let assignedShifs = getEmpResponse.assignedshifts;
  assignedShifs.forEach(shift=>{
    let isOverlap = checkIntervalOverlap(shift_start,shift_end,shift.starttime,shift.endtime);
    console.log("Overlap is ", isOverlap);
    return isOverlap;
  });
  return false;

}

function apiResponse(statusCode, responseBody) {
  return {
    isBase64Encoded: false,
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(responseBody)
  };
}

module.exports.addEmployee = async (event,context,callback) => {
 
  let empObj = JSON.parse(event.body);
  let empName = empObj.Name;
  let empDob = empObj.DOB;
  let empDept = empObj.Dept;
  let empRole = empObj.Role;
  let empSkills = empObj.Skills;
  let availability = empObj.Availability;
  let dbresponse;
  let itemCount;


  const params = {
    TableName: empTable,
    Select: "COUNT",
  };

  const dbService = new DynamoDBService();

  await dbService.scanTable(params).then(async (getCountResponse) => {
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
      empskills: empSkills,
      assignedshifts : [],
      availability : availability

    }
  };
  
  
  await dbService.createRecord(dbparams).then(async (createResponse) => {
    console.log("Add Employee DB Response:"+JSON.stringify(createResponse));
    dbresponse = createResponse;
  });
  callback(null,apiResponse(200,dbresponse));
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
    console.log("Employee Table Update Response:"+JSON.stringify(updateResponse));
    dbresponse = updateResponse;
  });
  callback(null,apiResponse(200,dbresponse));
};

module.exports.createShift = async (event,context,callback) => {
 
  let shiftObj = JSON.parse(event.body);

  let startTime = shiftObj.StartTime;
  let endTime = shiftObj.EndTime;
  let dept = shiftObj.Dept;
  let skills = shiftObj.Skills;
  let dbresponse;

  let shift_id_generate = Date.now().toString();
  console.log(shift_id_generate);
  

  const dbparams = {
    TableName : shiftTable,
    Item : {
      shiftid : shift_id_generate,
      starttime: startTime,
      endtime: endTime,
      dept : dept,
      skills : skills
    }
  };
  
  const dbService = new DynamoDBService();
  await dbService.createRecord(dbparams).then(async (createResponse) => {
    console.log("Create Shift Table Response:"+JSON.stringify(createResponse));
    dbresponse = createResponse;
  });
  callback(null,apiResponse(200,dbresponse));
};


module.exports.getShifts = async (event,context,callback) => {
 
  let startTime = event.queryStringParameters['start'];
  let endTime = event.queryStringParameters['end'];
  let dbresponse;

  const params = {
    TableName: shiftTable,
    FilterExpression: '#start <= :startTime AND #end >= :endTime',
    ExpressionAttributeNames: {
      '#start': 'starttime',
      '#end': 'endtime',
    },
    ExpressionAttributeValues: {
      ':startTime': startTime,
      ':endTime': endTime
    }
  };

  const dbService = new DynamoDBService();

  await dbService.scanTable(params).then(async (getRecordsResponse) => {
    console.log("Shift Period Table Response:"+JSON.stringify(getRecordsResponse));
    dbresponse = getRecordsResponse;
  });

  callback(null,apiResponse(200,dbresponse));
};

module.exports.assignShift = async (event,context,callback) => {
 
  let empObj = JSON.parse(event.body);
  let employeeId = event.pathParameters['id'];
  let shiftId = empObj.ShiftId;
  let dbresponse;
  let shiftResponse;
  let shiftResponseList = [];
  let getEmpResponse;

  const dbService = new DynamoDBService();

  const getShiftParams = {
    TableName: shiftTable,
    Key: {
      shiftid: shiftId
    }
  };

  await dbService.getItem(getShiftParams).then(async (getItemResponse) => {
    console.log("Shift Details Response:"+JSON.stringify(getItemResponse));
    shiftResponse = getItemResponse.Item;
  });

  let shiftSkills = shiftResponse.skills;

  const getEmpParams = {
    TableName: empTable,
    Key: {
      employeeid: employeeId
    }
  };

  await dbService.getItem(getEmpParams).then(async (getEmpItemResponse) => {
    console.log("Employee Details Response:"+JSON.stringify(getEmpItemResponse));
    getEmpResponse = getEmpItemResponse.Item;
  });

  let empSkills = getEmpResponse.empskills;

  let deptMatch = (getEmpResponse.empdept==shiftResponse.dept);
  
  let checkOverlap = checkConflicts(shiftResponse, getEmpResponse);
  
  let checkSkillMatch = shiftSkills.every(item => empSkills.includes(item));

  let checkAvailability = availabilityCheck(shiftResponse,getEmpResponse.availability);

  console.log("Availability is ", checkAvailability);
  console.log("Dept Match ", deptMatch);
  console.log("No Overlap is ", !checkOverlap);
  console.log("Skills Match is ", checkSkillMatch);


  if(checkSkillMatch && !checkOverlap && deptMatch && checkAvailability){
    shiftResponseList.push(shiftResponse);
    const dbparams = {
      TableName : empTable,
      Key: {
        employeeid: employeeId
      },
      UpdateExpression: 'set assignedshifts = list_append(assignedshifts,:shiftResponse)',
      ExpressionAttributeValues: {
        ':shiftResponse': shiftResponseList
      },
      ReturnValues: 'UPDATED_NEW'
    };

    await dbService.updateRecord(dbparams).then(async (updateResponse) => {
      console.log("Employee Shift Update Response:"+JSON.stringify(updateResponse));
      dbresponse = updateResponse;
    });
    callback(null,apiResponse(200,dbresponse));
  }else{
    callback(null,apiResponse(304,"Not Modified"));
  }

  
};

module.exports.getAssignedShifts = async (event,context,callback) => {
  
  let employeeId = event.pathParameters['id'];
  let startTime = event.queryStringParameters['start'];
  let endTime = event.queryStringParameters['end'];
  let dbresponse;
  let filteredResponse=[];

  const assignedShiftParams = {
    TableName: empTable,
    Key: {
      employeeid: employeeId
    }
  };

  const dbService = new DynamoDBService();

  await dbService.getItem(assignedShiftParams).then(async (getItemResponse) => {
    console.log("Assigned Shift Details Response:"+JSON.stringify(getItemResponse));
    dbresponse = getItemResponse.Item.assignedshifts;
  });
  
  filteredResponse = dbresponse.filter(shift => {
    // let shiftStartTime = new Date(shift.starttime);
    // let shiftEndTime = new Date(shift.endtime);
    return shift.starttime >= startTime && shift.endtime <= endTime;
  });
  console.log("Filtered ",filteredResponse);

  callback(null,apiResponse(200,filteredResponse));
};