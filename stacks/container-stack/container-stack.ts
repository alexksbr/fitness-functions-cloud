import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cloudmap from "aws-cdk-lib/aws-servicediscovery";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";

export class ContainerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "Cluster", {
      defaultCloudMapNamespace: { name: "CloudMap" },
    });

    cluster.addCapacity("DefaultAutoScalingGroupCapacity", {
      instanceType: new ec2.InstanceType("t2.small"),
      desiredCapacity: 2,
      minCapacity: 2,
      maxCapacity: 4,
    });

    const stockServiceTaskDefinition = new ecs.Ec2TaskDefinition(
      this,
      "StockServiceTaskDefinition"
    );
    stockServiceTaskDefinition.addContainer("StockServiceContainer", {
      image: ecs.ContainerImage.fromAsset(
        "./stacks/container-stack/services/stock-service"
      ),
      portMappings: [{ containerPort: 8080 }],
      memoryLimitMiB: 512,
    });

    new ecs.Ec2Service(this, "StockService", {
      cluster,
      taskDefinition: stockServiceTaskDefinition,
      desiredCount: 1,
      cloudMapOptions: { dnsRecordType: cloudmap.DnsRecordType.SRV },
    });

    const financialServiceTaskDefinition = new ecs.Ec2TaskDefinition(
      this,
      "FinancialServiceTaskDefinition"
    );
    financialServiceTaskDefinition.addContainer("FinancialServiceContainer", {
      image: ecs.ContainerImage.fromAsset(
        "./stacks/container-stack/services/financial-service"
      ),
      portMappings: [{ containerPort: 8080 }],
      memoryLimitMiB: 512,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "FinancialService" }),
    });

    new ecsPatterns.ApplicationLoadBalancedEc2Service(
      this,
      "FinancialService",
      {
        cluster,
        taskDefinition: financialServiceTaskDefinition,
        desiredCount: 1,
      }
    );
  }
}
