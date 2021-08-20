// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const AWS = require('aws-sdk');

const moment = require('moment');
const docClient = new AWS.DynamoDB.DocumentClient({endpoint: "http://host.docker.internal:8000"});

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

  var s3bucket = new AWS.S3({accessKeyId: "lucas",
                            secretAccessKey: 'lucas',
                            endpoint: "http://host.docker.internal:4566",
                            s3ForcePathStyle: true });
 async function uploadFileOnS3(fileName, fileData){

  var buf = Buffer.from(JSON.stringify(fileData));
     var params = {
       Bucket: "teste-data",
       Key: fileName,
       Body: buf,
       ContentEncoding: 'base64',
       ContentType: 'application/json',
       ACL: 'public-read'
     };
     await s3bucket.upload(params, function (err, res) {
       console.log("INSERINDO...");               
         if(err)
             console.log("Error in uploading file on s3 due to "+ err)
         else    
             console.log("File successfully uploaded.")
     }).promise();
 }


 async function queryItems(){
    try {
        let v = moment(new Date()).format("yyyy-MM-DD");
        console.log("====>>"+v);
      const data = await docClient.scan({TableName: "vinculo_propostas", FilterExpression: "#data between :start_at and :end_at",
      ExpressionAttributeValues: { ':start_at': v+"T00:00:00+00:00", ':end_at': v+"T23:59:59+00:00"},
      ExpressionAttributeNames: { '#data': 'data_inclusao' }}).promise()
      const a = new Date().getMilliseconds();
      console.log("Começou "+a);
      await uploadFileOnS3("2021-08-20-data", data);
      const b = new Date().getMilliseconds();
      console.log("Terminou "+b);
      return data
    } catch (err) {
        console.log("ERRO");
        console.log(err);
      return err
    }
  }

exports.lambdaHandler = async (event, context) => {
    try {
        // const ret = await axios(url);
        
        const data = await queryItems()

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'hello world',
                date: data
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
