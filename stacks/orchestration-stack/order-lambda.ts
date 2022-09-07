import * as AWS from "aws-sdk";

enum OrderType {
  BusinessOrder,
  ConsumerOrder,
}

const lambda = new AWS.Lambda();
const sns = new AWS.SNS();

const businessWarehouseLambdaName =
  process.env.BUSINESS_WAREHOUSE_LAMBDA_NAME ?? "";
const consumerWarehouseLambdaName =
  process.env.CONSUMER_WAREHOUSE_LAMBDA_NAME ?? "";
const consumerLoyaltyLambdaName =
  process.env.CONSUMER_LOYALTY_LAMBDA_NAME ?? "";
const consumerTopicArn = process.env.CONSUMER_ORDER_TOPIC_ARN ?? "";

export async function handler() {
  const orderType = getOrderType();
  console.log("OrderLambda invoked");

  await pointToPointInvocation(orderType);
  // await eventBasedInvocation(orderType);
}

async function pointToPointInvocation(orderType: OrderType) {
  if (orderType === OrderType.BusinessOrder) {
    console.log("BusinessOrder registered");
    console.log("Invoke BusinessWarehouseLambda");
    await lambda
      .invoke({ FunctionName: businessWarehouseLambdaName })
      .promise();
  } else {
    console.log("ConsumerOrder registered");
    console.log("Invoke ConsumerWarehouseLambda");
    await lambda
      .invoke({ FunctionName: consumerWarehouseLambdaName })
      .promise();
    console.log("Invoke ConsumerLoyaltyLambda");
    await lambda.invoke({ FunctionName: consumerLoyaltyLambdaName }).promise();
  }
}

async function eventBasedInvocation(orderType: OrderType) {
  if (orderType === OrderType.BusinessOrder) {
    console.log("BusinessOrder registered");
    console.log("Invoke BusinessWarehouseLambda");
    await lambda
      .invoke({ FunctionName: businessWarehouseLambdaName })
      .promise();
  } else {
    console.log("ConsumerOrder registered");
    console.log("Publish to ConsumerOrderTopic");
    await sns
      .publish({ TopicArn: consumerTopicArn, Message: "ConsumerOrder" })
      .promise();
  }
}

function getOrderType() {
  if (Math.random() <= 0.2) {
    return OrderType.BusinessOrder;
  } else {
    return OrderType.ConsumerOrder;
  }
}
