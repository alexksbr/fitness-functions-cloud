#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DeploymentApplication } from "../lib/deployment-application";

const app = new cdk.App();
export const deploymentApplication = new DeploymentApplication(
  app,
  "DeploymentApplication"
);
