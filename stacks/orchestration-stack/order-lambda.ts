import * as AWS from "aws-sdk";

enum OrderType {
  BusinessOrder,
  ConsumerOrder,
}

const lambda = new AWS.Lambda();

const businessWarehouseLambdaName =
  process.env.BUSINESS_WAREHOUSE_LAMBDA_NAME ?? "";
const consumerWarehouseLambdaName =
  process.env.CONSUMER_WAREHOUSE_LAMBDA_NAME ?? "";
const consumerLoyaltyLambdaName =
  process.env.CONSUMER_LOYALTY_LAMBDA_NAME ?? "";

export async function handler() {
  const orderType = getOrderType();
  console.log("OrderLambda invoked");

  if (orderType === OrderType.BusinessOrder) {
    console.log("BusinessOrder registered");
    await lambda
      .invoke({ FunctionName: businessWarehouseLambdaName })
      .promise();
  } else {
    console.log("ConsumerOrder registered");
    await lambda
      .invoke({ FunctionName: consumerWarehouseLambdaName })
      .promise();
    await lambda.invoke({ FunctionName: consumerLoyaltyLambdaName }).promise();
  }
}

function getOrderType() {
  if (Math.round(Math.random()) === 0) {
    return OrderType.BusinessOrder;
  } else {
    return OrderType.ConsumerOrder;
  }
}
