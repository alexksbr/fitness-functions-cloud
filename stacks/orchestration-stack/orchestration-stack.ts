import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as cloudtrail from "aws-cdk-lib/aws-cloudtrail";

export class OrchestrationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const businessWarehouseLambda = new lambda.NodejsFunction(
      this,
      "BusinessWarehouseLambda",
      { entry: "stacks/orchestration-stack/business-warehouse-lambda.ts" }
    );
    const consumerWarehouseLambda = new lambda.NodejsFunction(
      this,
      "ConsumerWarehouseLambda",
      { entry: "stacks/orchestration-stack/consumer-warehouse-lambda.ts" }
    );
    const consumerLoyaltyLambda = new lambda.NodejsFunction(
      this,
      "ConsumerLoyaltyLambda",
      { entry: "stacks/orchestration-stack/consumer-loyalty-lambda.ts" }
    );

    const orderLambda = new lambda.NodejsFunction(this, "OrderLambda", {
      entry: "stacks/orchestration-stack/order-lambda.ts",
      environment: {
        BUSINESS_WAREHOUSE_LAMBDA_NAME: businessWarehouseLambda.functionName,
        CONSUMER_WAREHOUSE_LAMBDA_NAME: consumerWarehouseLambda.functionName,
        CONSUMER_LOYALTY_LAMBDA_NAME: consumerLoyaltyLambda.functionName,
      },
    });
    businessWarehouseLambda.grantInvoke(orderLambda);
    consumerWarehouseLambda.grantInvoke(orderLambda);
    consumerLoyaltyLambda.grantInvoke(orderLambda);

    new events.Rule(this, "OrderLambdaEventRule", {
      schedule: events.Schedule.cron({ minute: "*" }),
      targets: [new targets.LambdaFunction(orderLambda)],
    });

    this.enableCloudTrail();
  }

  private enableCloudTrail() {
    const trail = new cloudtrail.Trail(this, "LambdaTrail", {
      sendToCloudWatchLogs: true,
    });
    trail.logAllLambdaDataEvents();
  }
}
