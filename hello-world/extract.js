const AWS = require('aws-sdk');
const moment = require('moment');
const docClient = new AWS.DynamoDB.DocumentClient();

var params = {
  TableName: 'Music',
  IndexName: 'some-index',
  KeyConditionExpression: '#name = :value',
  ExpressionAttributeValues: { ':value': 'shoes' },
  ExpressionAttributeNames: { '#name': 'name' }
}

async function queryItems(){
  try {
    const data = await docClient.scan({TableName: "vinculo_propostas", FilterExpression: "data_inclusao = :date",
  ExpressionAttributeValues: {
    "date": moment.now().format("yyyy-dd-MM")
  }}).promise()
    return data
  } catch (err) {
    return err
  }
}

exports.handler = async (event, context) => {
  try {
    const data = await queryItems()
    return { body: JSON.stringify(data) }
  } catch (err) {
    return { error: err }
  }
}