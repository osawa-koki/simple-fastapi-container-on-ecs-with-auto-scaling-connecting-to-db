import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';

interface ComputeStackProps extends cdk.StackProps {
  stackName: string;
  vpc: ec2.Vpc;
  databaseSecret: ISecret;
}

export default class ComputeStack extends cdk.Stack {
  public readonly fargateService: ecsPatterns.ApplicationLoadBalancedFargateService;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    const { stackName, vpc, databaseSecret } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    // ECSクラスターの作成
    const cluster = new ecs.Cluster(this, 'FargateCluster', {
      vpc,
      clusterName: 'FastapiEcsCluster',
    });

    // Fargateタスク定義の作成
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'FargateTaskDef', {
      cpu: 512,
      memoryLimitMiB: 1024,
    });

    // ECRプル権限の追加
    taskDefinition.addToExecutionRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        resources: ["*"]
      })
    );

    const container = taskDefinition.addContainer('WebContainer', {
      image: ecs.ContainerImage.fromRegistry(process.env.ECR_REPOSITORY_URI!),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'FargateWebApp' }),
      containerName: 'FastapiEcsContainer',
      secrets: {
        DB_HOST: ecs.Secret.fromSecretsManager(databaseSecret, 'host'),
        DB_PORT: ecs.Secret.fromSecretsManager(databaseSecret, 'port'),
        DB_USER: ecs.Secret.fromSecretsManager(databaseSecret, 'username'),
        DB_PASSWORD: ecs.Secret.fromSecretsManager(databaseSecret, 'password'),
      },
    });

    container.addPortMappings({
      containerPort: 80,
      hostPort: 80,
    });

    const fargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      publicLoadBalancer: true,
      desiredCount: 1,
      assignPublicIp: false,
      listenerPort: 80,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE',
          weight: 1,
        },
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
    });

    // Auto Scalingの設定
    const scaling = fargateService.service.autoScaleTaskCount({
      maxCapacity: 3,
      minCapacity: 2,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    fargateService.service.connections.allowFrom(
      fargateService.loadBalancer,
      ec2.Port.tcp(80),
      'Allow only ALB access'
    );

    fargateService.taskDefinition.addToExecutionRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ],
        resources: ["*"]
      })
    );

    this.fargateService = fargateService;
  }
}
