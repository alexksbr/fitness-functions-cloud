import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";

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

    const taskDefinition = new ecs.Ec2TaskDefinition(this, "TaskDef");

    taskDefinition.addContainer("DefaultContainer", {
      image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      memoryLimitMiB: 512,
      portMappings: [{ containerPort: 80 }],
    });

    new ecsPatterns.ApplicationLoadBalancedEc2Service(this, "Service", {
      cluster,
      taskDefinition,
      desiredCount: 2,
    });
  }
}
