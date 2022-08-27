import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as pipelines from "aws-cdk-lib/pipelines";
import { deploymentApplication } from "./deployment-application/bin/deployment-application";

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
  }
}
