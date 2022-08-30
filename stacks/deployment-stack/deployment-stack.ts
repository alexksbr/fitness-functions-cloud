import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as pipelines from "aws-cdk-lib/pipelines";
import * as sns from "aws-cdk-lib/aws-sns";
import { deploymentApplication } from "./deployment-application/bin/deployment-application";
import { PipelineNotificationEvents } from "aws-cdk-lib/aws-codepipeline";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";

export class DeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const repo = new codecommit.Repository(this, "Repository", {
      repositoryName: "CodeRepository",
      code: codecommit.Code.fromDirectory(
        "stacks/deployment-stack/deployment-application"
      ),
    });

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      synth: new pipelines.ShellStep("Synth", {
        input: pipelines.CodePipelineSource.codeCommit(repo, "main"),
        commands: ["npm i", "npm run build", "npx cdk synth"],
      }),
      selfMutation: false,
    });
    pipeline.addStage(deploymentApplication);
    pipeline.buildPipeline();

    const pipelineSuccessTopic = new sns.Topic(this, "PipelineSuccessTopic");
    const pipelineFailureTopic = new sns.Topic(this, "PipelineFailureTopic");
    pipeline.pipeline.notifyOn("PipelineSuccess", pipelineSuccessTopic, {
      events: [PipelineNotificationEvents.PIPELINE_EXECUTION_SUCCEEDED],
    });
    pipeline.pipeline.notifyOn("PipelineFailure", pipelineFailureTopic, {
      events: [PipelineNotificationEvents.PIPELINE_EXECUTION_FAILED],
    });

    const dashboard = new cloudwatch.Dashboard(this, "DeploymentDashboard");
    const successRate = new cloudwatch.MathExpression({
      expression: "success / (success + failure)",
      usingMetrics: {
        success: pipelineSuccessTopic.metricNumberOfMessagesPublished(),
        failure: pipelineFailureTopic.metricNumberOfMessagesPublished(),
      },
    });
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "Pipeline success rate",
        left: [successRate],
        period: Duration.hours(12),
      })
    );
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "Pipeline successes",
        left: [pipelineSuccessTopic.metricNumberOfMessagesPublished()],
        period: Duration.hours(12),
      })
    );
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: "Pipeline failures",
        left: [pipelineFailureTopic.metricNumberOfMessagesPublished()],
        period: Duration.hours(12),
      })
    );
  }
}
