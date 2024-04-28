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


      async getItemCount(dbParams){
        return new Promise(async (resolve, reject) => {  
        var dbGetItemCountPromise = dynamodb.scan(dbParams).promise();
        dbGetItemCountPromise.then(function(data) {
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