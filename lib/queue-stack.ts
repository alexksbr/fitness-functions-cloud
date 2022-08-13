import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
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

    new events.Rule(this, "OrderLambdaEventRule", {
      schedule: events.Schedule.cron({}),
      targets: [new targets.LambdaFunction(orderLambda)],
    });

    this.createCloudWatchDashboard(orderQueue);
  }

  private createCloudWatchDashboard(orderQueue: sqs.Queue) {
    const dashboard = new cloudwatch.Dashboard(this, "OrderDashboard");
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "New queue objects",
        left: [orderQueue.metricNumberOfMessagesSent()],
      })
    );
  }
}
