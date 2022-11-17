# Examples for my talk "Architectural Fitness Functions for Cloud Applications"

## Example 1: AWS Config
You can deploy the `OrchestrationStack` to spin up some lambdas.
You can use the `ConfigStack` to provision a DLQ check.
In `/stacks/config-stack` you can also find `sample-conformance-pack.yml` which zou can upload when manually configuring conformance pack.

Commands:
`cdk deploy OrchestrationStack`
`cdk deploy ConfigStack`

## Example 2: Reducing point-to-point communication
You can deploy the `OrchestrationStack` to provision
- the lambda infrastructure
- enable CloudTrail logging
- provision CloudWatch dashboard to map point-to-point vs non-point-to-point communication

Commands:
`cdk deploy OrchestrationStack`

## Example 3: Chaos Engineering
You can deploy the `ContainerStack` to spin up the example containing an ECS cluster with the respective services.
A circuit breaker and cache is implemented.
You can then configure and start chaos experiments in the AWS Fault Injection Simulator service.

Commands:
`cdk deploy ContainerStack`


## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
