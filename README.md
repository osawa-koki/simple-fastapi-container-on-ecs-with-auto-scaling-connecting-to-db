# simple-fastapi-container-on-ecs-with-auto-scaling-connecting-to-db

🧟‍♂️🧟‍♂️🧟‍♂️ FastAPIのコンテナ(ECR)をECS(Fargate起動タイプ)にAuto Scalingでスケーリング性を持つようにデプロイしてみる！(DB接続あり！)  

## 実行方法

DevContainerに入り、以下のコマンドを実行します。  
※ `~/.aws/credentials`にAWSの認証情報があることを前提とします。  

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
