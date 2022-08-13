import { Duration, lambda_layer_awscli, Stack, StackProps } from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class QueueStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const orderQueue = new sqs.Queue(this, "OrderQueue", {
      visibilityTimeout: Duration.seconds(300),
    });

    const orderLambda = new lambda.NodejsFunction(this, "OrderLambda", {
      entry: "lambdas/order-lambda.ts",
      environment: { ORDER_QUEUE_URL: orderQueue.queueUrl },
    });

    orderQueue.grantSendMessages(orderLambda);
  }
}
