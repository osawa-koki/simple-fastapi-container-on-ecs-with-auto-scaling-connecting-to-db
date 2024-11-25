import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

import * as dotenv from 'dotenv';

import NetworkStack from './network/network';
import ComputeStack from './compute/compute';
import OutputStack from './output/output';
import DatabaseStack from './database/database';
import { BASE_STACK_NAME } from './const';

dotenv.config();

export class FastapiEcsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      stackName: BASE_STACK_NAME,
    });

    const networkStack = new NetworkStack(this, 'NetworkStack', {
      stackName: `${BASE_STACK_NAME}-NetworkStack`,
    });

    const databaseStack = new DatabaseStack(this, 'DatabaseStack', {
      stackName: `${BASE_STACK_NAME}-DatabaseStack`,
      vpc: networkStack.vpc,
    });

    const computeStack = new ComputeStack(this, 'ComputeStack', {
      stackName: `${BASE_STACK_NAME}-ComputeStack`,
      vpc: networkStack.vpc,
      databaseSecret: databaseStack.aurora.secret!,
    });

    new OutputStack(this, 'OutputStack', {
      stackName: `${BASE_STACK_NAME}-OutputStack`,
      fargateService: computeStack.fargateService,
    });
  }
}
