# Contest Starter (Next.js + AWS CDK)

Starter for a contest landing page + AWS serverless backend:
- Next.js (TypeScript) frontend (App Router)
- AWS CDK (TypeScript) deploys:
  - DynamoDB (entries + dedupe locks)
  - API Gateway HTTP API
  - Lambda: createEntry (POST /entry)
  - Lambda: sendScheduledEmail (invoked by EventBridge Scheduler)
  - EventBridge Scheduler group + invoke role
  - SES send permissions (you must verify sender/domain in SES)

## Prerequisites
- Node.js 18+ (Node 20 recommended)
- AWS CLI configured (aws configure)

## 1) Deploy the AWS backend (CDK)
```bash
cd infra
npm i

export FROM_EMAIL="contest@yourdomain.com"
export DEDUPE_SALT="use-a-long-random-secret-string"

npx cdk bootstrap
npm run deploy:dev
```

CDK outputs `HttpApiUrl`. Copy it into `frontend/.env.local`.

## 2) Run the frontend locally
```bash
cd ../frontend
npm i
cp .env.local.example .env.local
# paste NEXT_PUBLIC_API_URL from CDK output
npm run dev
```

Notes:
- SES may be in sandbox initially; request production access and verify domain + DKIM/SPF.
- This starter creates 2 schedules per entrant (reminder + draw-day). For huge volume, switch to batch sends.
