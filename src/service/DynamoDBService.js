const AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB.DocumentClient();


class DynamoDBService {
    async createRecord(dbParams){
        return new Promise(async (resolve, reject) => {  
        var dbCreateItemPromise = dynamodb.put(dbParams).promise();
        dbCreateItemPromise.then(function(data) {
            console.log('Success Response', data);
            resolve(data);
        }).catch(function(error) {
            console.log("Error:",error);
            reject(error);
        });    
        
       
      });
      }

      async updateRecord(dbParams){
        return new Promise(async (resolve, reject) => {  
        var dbUpdateItemPromise = dynamodb.update(dbParams).promise();
        dbUpdateItemPromise.then(function(data) {
            console.log('Success Response', data);
            resolve(data);
        }).catch(function(error) {
            console.log("Error:",error);
            reject(error);
        });           
       
      });
      }


      async scanTable(dbParams){
        return new Promise(async (resolve, reject) => {  
        var dbScanTablePromise = dynamodb.scan(dbParams).promise();
        dbScanTablePromise.then(function(data) {
            console.log('Success Response', data);
            resolve(data);
        }).catch(function(error) {
            console.log("Error:",error);
            reject(error);
        });    
        
       
      });
      }

      async getItem(dbParams){
        return new Promise(async (resolve, reject) => {  
        var dbGetItemPromise = dynamodb.get(dbParams).promise();
        dbGetItemPromise.then(function(data) {
            console.log('Success Response', data);
            resolve(data);
        }).catch(function(error) {
            console.log("Error:",error);
            reject(error);
        });    
        
       
      });
      }
}

module.exports = DynamoDBService;