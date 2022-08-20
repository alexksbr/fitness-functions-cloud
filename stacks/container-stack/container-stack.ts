import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cloudmap from "aws-cdk-lib/aws-servicediscovery";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";

export class ContainerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, "Cluster", {
      defaultCloudMapNamespace: { name: "CloudMap" },
    });

    const autoscalingGroup = cluster.addCapacity(
      "DefaultAutoScalingGroupCapacity",
      {
        instanceType: new ec2.InstanceType("t2.small"),
        desiredCapacity: 2,
        minCapacity: 2,
        maxCapacity: 4,
      }
    );

    const securityGroup = new ec2.SecurityGroup(this, "InstanceSecurityGroup", {
      vpc: cluster.vpc,
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(
      securityGroup,
      ec2.Port.tcpRange(32768, 65535)
    );
    autoscalingGroup.addSecurityGroup(securityGroup);

    const stockServiceTaskDefinition = new ecs.Ec2TaskDefinition(
      this,
      "StockServiceTaskDefinition"
    );
    stockServiceTaskDefinition.addContainer("StockServiceContainer", {
      image: ecs.ContainerImage.fromDockerImageAsset(
        new ecrAssets.DockerImageAsset(this, "StockServiceDockerImageAsset", {
          directory: "./stacks/container-stack/services/stock-service",
          platform: ecrAssets.Platform.LINUX_AMD64,
        })
      ),
      portMappings: [{ containerPort: 8080 }],
      memoryLimitMiB: 512,
    });

    const stockService = new ecs.Ec2Service(this, "StockService", {
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
      image: ecs.ContainerImage.fromDockerImageAsset(
        new ecrAssets.DockerImageAsset(
          this,
          "FinancialServiceDockerImageAsset",
          {
            directory: "./stacks/container-stack/services/financial-service",
            platform: ecrAssets.Platform.LINUX_AMD64,
          }
        )
      ),
      portMappings: [{ containerPort: 8080 }],
      memoryLimitMiB: 512,
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: "FinancialService" }),
      environment: {
        STOCK_SERVICE_ID: stockService.cloudMapService?.serviceId ?? "",
      },
    });
    financialServiceTaskDefinition.addToTaskRolePolicy(
      new iam.PolicyStatement({
        resources: ["*"],
        actions: ["servicediscovery:List*"],
      })
    );

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
