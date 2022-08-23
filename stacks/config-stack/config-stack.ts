import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as config from "aws-cdk-lib/aws-config";

export class ConfigStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new config.ManagedRule(this, "LambdaDlqCheck", {
      identifier: config.ManagedRuleIdentifiers.LAMBDA_DLQ_CHECK,
    });
  }
}
