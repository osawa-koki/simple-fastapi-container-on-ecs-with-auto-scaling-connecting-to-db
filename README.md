# simple-fastapi-container-on-ecs-with-auto-scaling-connecting-to-db

🧟‍♂️🧟‍♂️🧟‍♂️ FastAPIのコンテナ(ECR)をECS(Fargate起動タイプ)にAuto Scalingでスケーリング性を持つようにデプロイしてみる！(DB接続あり！)  

[![ci](https://github.com/osawa-koki/simple-fastapi-container-on-ecs-with-auto-scaling-connecting-to-db/actions/workflows/ci.yml/badge.svg)](https://github.com/osawa-koki/simple-fastapi-container-on-ecs-with-auto-scaling-connecting-to-db/actions/workflows/ci.yml)
[![cd](https://github.com/osawa-koki/simple-fastapi-container-on-ecs-with-auto-scaling-connecting-to-db/actions/workflows/cd.yml/badge.svg)](https://github.com/osawa-koki/simple-fastapi-container-on-ecs-with-auto-scaling-connecting-to-db/actions/workflows/cd.yml)
[![Dependabot Updates](https://github.com/osawa-koki/simple-fastapi-container-on-ecs-with-auto-scaling-connecting-to-db/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/osawa-koki/simple-fastapi-container-on-ecs-with-auto-scaling-connecting-to-db/actions/workflows/dependabot/dependabot-updates)

![成果物](./fruit.gif)  

## 技術スタック

- CDK
  - CloudFormation
  - TypeScript
- ALB
- ECS
  - Fargate
- Aurora
  - MySQL
- Secrets Manager

## 実行方法

`.env.example`をコピーして`.env`を作成します。  
中身を適切に設定してください。  

DevContainerに入り、以下のコマンドを実行します。  
※ `~/.aws/credentials`にAWSの認証情報があることを前提としています。  

```bash
cdk synth
cdk bootstrap
cdk deploy --require-approval never --all
```

エンドポイントを取得します。  

```bash
aws cloudformation describe-stacks --stack-name FastapiEcsStack-OutputStack --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' --output text
```

プロトコルはHTTPです。  

---

GitHub Actionsでデプロイする場合は、以下のシークレットを設定してください。  

| シークレット名 | 説明 |
| --- | --- |
| AWS_ACCESS_KEY_ID | AWSのアクセスキーID |
| AWS_SECRET_ACCESS_KEY | AWSのシークレットアクセスキー |
| AWS_REGION | AWSのリージョン |
| DOTENV | `.env`ファイルの中身 (`.env.example`を参照) |

タグをプッシュすると、GitHub Actionsが動作します。  
手動でトリガーすることも可能です。  
