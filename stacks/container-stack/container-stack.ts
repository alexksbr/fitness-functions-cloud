import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";

export class ContainerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "Cluster");

    cluster.addCapacity("DefaultAutoScalingGroupCapacity", {
      instanceType: new ec2.InstanceType("t2.small"),
      desiredCapacity: 2,
      minCapacity: 2,
      maxCapacity: 4,
    });

    const taskDefinition = new ecs.Ec2TaskDefinition(
      this,
      "StockServiceTaskDefinition"
    );
    taskDefinition.addContainer("StockServiceContainer", {
      image: ecs.ContainerImage.fromAsset(
        "./stacks/container-stack/services/stock-service"
      ),
      portMappings: [{ containerPort: 80 }],
      memoryLimitMiB: 512,
    });

    new ecs.Ec2Service(this, "StockService", {
      cluster,
      taskDefinition,
      desiredCount: 1,
    });
  }
}
