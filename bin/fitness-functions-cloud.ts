#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ContainerStack } from "../stacks/container-stack/container-stack";
import { QueueStack } from "../stacks/queue-stack/queue-stack";

const app = new cdk.App();
new QueueStack(app, "QueueStack");
new ContainerStack(app, "ContainerStack");
