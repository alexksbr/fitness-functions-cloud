import * as AWS from "aws-sdk";

const orderQueueUrl = process.env.ORDER_QUEUE_URL;

const sqs = new AWS.SQS();

export async function handler() {
  const numberOfOrders = Math.random() * 50;

  console.log(`Order lambda called with ${numberOfOrders} orders`);

  if (!orderQueueUrl) {
    throw "Environment variable ORDER_QUEUE_URL not set";
  }

  for (let i = 0; i < numberOfOrders; i++) {
    await sqs
      .sendMessage({
        QueueUrl: orderQueueUrl,
        MessageBody: "New order received",
      })
      .promise();

    console.log("Message sent to order queue");
  }
}
