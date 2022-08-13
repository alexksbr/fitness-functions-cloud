import * as AWS from "aws-sdk";

const orderQueueUrl = process.env.ORDER_QUEUE_URL;

const sqs = new AWS.SQS();

export async function handler() {
  console.log("Order lambda called");

  if (!orderQueueUrl) {
    throw "Environment variable ORDER_QUEUE_URL not set";
  }

  await sqs
    .sendMessage({ QueueUrl: orderQueueUrl, MessageBody: "Hello world" })
    .promise();

  console.log("Message sent to order queue");
}
