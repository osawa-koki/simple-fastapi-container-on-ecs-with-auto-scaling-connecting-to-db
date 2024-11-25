import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

interface DatabaseStackProps extends cdk.StackProps {
  stackName: string;
  vpc: ec2.Vpc;
}

export default class DatabaseStack extends cdk.Stack {
  public readonly aurora: rds.DatabaseCluster;

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    const { stackName, vpc } = props;

    super(scope, id, {
      ...props,
      stackName,
    });

    // Auroraの作成 (MySQL)
    const aurora = new rds.DatabaseCluster(this, 'Aurora', {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_04_0
      }),
      credentials: rds.Credentials.fromGeneratedSecret(process.env.AURORA_USERNAME!, {
        secretName: process.env.AURORA_CREDENTIALS_SECRET_NAME!,
      }),
      deletionProtection: false,
      instanceProps: {
        vpc,
        publiclyAccessible: false,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      },
    });

    // セキュリティグループの設定を追加
    aurora.connections.allowFrom(ec2.Peer.ipv4(vpc.vpcCidrBlock), ec2.Port.tcp(3306), 'Allow Aurora to be accessed from the VPC');

    this.aurora = aurora;
  }
}
