# Employee-Scheduler
Design and implement core functionalities of a backend system for managing employee schedules in a retail store chain.

The Backend APIs have been implemented using AWS Lambdas (Serverless Framework). The Nodejs Application is hosted on AWS.

**AWS Components used :**
        - AWS lambda
        - AWS Cloudwatch
        - AWS APIGateway
        - AWS IAM 
        - AWS DynamoDB 

**Two DynamoDB Tables:**

    1.Employee-Table
        
        - employeeid (primarykey)
        - assignedshift[]
        - availability[]
        - emptdept
        - empdob
        - empname
        - emprole
        - empskills[]

    2.Shift-table

        - shiftid (primarykey)
        - dept
        - starttime
        - endtime
        - skills   



**Prerequites :** 
    1. AWS Account 
    2. Install AWS CLI on the local machine. Setup the aws config for CLI
    3. Install Serverless cli on local machine
    3. Setup the DynamoDB in AWS console. Other AWS components will be handled by the serverless framework
    3. Update the environment file with the AWS components.(file {stage}-{region}.yml, Rename as per your stage and region)
    4. To deploy from cli type in terminal "sls deploy --region {region} --stage {stage}"

 **Once sls deploy is complete, you will get the endpoints for each API**
    POST - https://{URL}/employees
    PUT - https://{URL}/employees/{id}
    POST - https://{URL}/shifts
    GET - https://{URL}/shifts
    POST - https://{URL}/employees/{id}/assign-shift
    GET - https://{URL}/employees/{id}/schedule

 **Using postman , each of the endpoints can be tested.**
    
 **Payloads and Query Params for each**

    Note : All times in request body oor query params are in UTC format
        1. POST - https://{URL}/employees

        Request Body

        {
            "Name"      :   "Jane Doe",
            "DOB"       :   "11-29-1995",
            "Dept"      :   "process",
            "Role"      :   "sales",
            "Skills"    :   ["sales","support","process"],
            "Availability" : [
                                {
                                    "starttime" : "2024-04-28T08:00:00Z",
                                    "endtime"   : "2024-04-28T15:00:00Z"                      
                                },
                                {
                                    "starttime" : "2024-04-29T08:00:00Z",
                                    "endtime"   : "2024-04-29T17:00:00Z"  
                                }
                             ]
        }   


        2. PUT - https://{URL}/employees/{id}

        Request Body

        {
            "Role"   :   "Manager",
            "Dept"   :   "Appliances"      
        }

        3. POST - https://{URL}/shifts

        Request Body

        {
            "StartTime" :   "2024-04-29T08:00:00Z",
            "EndTime"   :   "2024-04-29T17:00:00Z",
            "Dept"      :   "process",
            "Skills"    :   ["sales"] 
        }

        4. GET - https://{URL}/shifts?start={Start time in UTC format}&end={End time in UTC format}  

        5. POST - https://{URL}/employees/{id}/assign-shift

        Request Body

        {
            "ShiftId"   :   "1714387719327"   //ID from shift table
        }

        6. GET - https://{URL}/employees/{id}/schedule?start={Start time in UTC format}&end={End time in UTC format} 