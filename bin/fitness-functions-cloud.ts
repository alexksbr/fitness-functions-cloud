#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ContainerStack } from "../lib/container-stack";
import { QueueStack } from "../lib/queue-stack";

const app = new cdk.App();
new QueueStack(app, "QueueStack");
new ContainerStack(app, "ContainerStack");
