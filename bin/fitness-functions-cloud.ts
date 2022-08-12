#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FitnessFunctionsCloudStack } from "../lib/fitness-functions-cloud-stack";

const app = new cdk.App();
new FitnessFunctionsCloudStack(app, "FitnessFunctionsCloudStack");
