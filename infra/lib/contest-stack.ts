import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodeLambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2Int from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as iam from "aws-cdk-lib/aws-iam";
import * as scheduler from "aws-cdk-lib/aws-scheduler";

export class ContestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stage = this.node.tryGetContext("stage") ?? "dev";

    const table = new dynamodb.Table(this, "EntriesTable", {
      tableName: `contest-${stage}-entries`,
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: stage === "prod" ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    const scheduleGroup = new scheduler.CfnScheduleGroup(this, "ScheduleGroup", {
      name: `contest-${stage}-schedules`,
    });

    const sendScheduledEmailFn = new nodeLambda.NodejsFunction(this, "SendScheduledEmailFn", {
      entry: "lambda/sendScheduledEmail.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        FROM_EMAIL: process.env.FROM_EMAIL ?? "replace-me@example.com",
        LANDING_PAGE_URL: process.env.LANDING_PAGE_URL ?? "https://phili-digital-jpmc-contest.vercel.app",
        RESEND_API_KEY: process.env.RESEND_API_KEY ?? "replace-me-with-resend-api-key",
      },
    });

    const schedulerInvokeRole = new iam.Role(this, "SchedulerInvokeRole", {
      assumedBy: new iam.ServicePrincipal("scheduler.amazonaws.com"),
      roleName: `contest-${stage}-scheduler-invoke-role`,
    });

    schedulerInvokeRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [sendScheduledEmailFn.functionArn],
      })
    );

    const createEntryFn = new nodeLambda.NodejsFunction(this, "CreateEntryFn", {
      entry: "lambda/createEntry.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        TABLE_NAME: table.tableName,
        FROM_EMAIL: process.env.FROM_EMAIL ?? "replace-me@example.com",
        LANDING_PAGE_URL: process.env.LANDING_PAGE_URL ?? "https://phili-digital-jpmc-contest.vercel.app",
        DEDUPE_SALT: process.env.DEDUPE_SALT ?? "replace-me-with-long-secret",
        SCHEDULE_GROUP: scheduleGroup.name!,
        SCHEDULER_TARGET_ROLE_ARN: schedulerInvokeRole.roleArn,
        SEND_EMAIL_LAMBDA_ARN: sendScheduledEmailFn.functionArn,
        RESEND_API_KEY: process.env.RESEND_API_KEY ?? "replace-me-with-resend-api-key",
      },
    });

    table.grantReadWriteData(createEntryFn);

    createEntryFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["scheduler:CreateSchedule", "scheduler:UpdateSchedule", "scheduler:DeleteSchedule", "scheduler:GetSchedule"],
        resources: ["*"],
      })
    );

    createEntryFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["iam:PassRole"],
        resources: [schedulerInvokeRole.roleArn],
      })
    );

    const httpApi = new apigwv2.HttpApi(this, "ContestHttpApi", {
      apiName: `contest-${stage}-api`,
      corsPreflight: {
        allowHeaders: ["content-type"],
        allowMethods: [apigwv2.CorsHttpMethod.POST, apigwv2.CorsHttpMethod.OPTIONS],
        allowOrigins: ["*"],
      },
    });

    httpApi.addRoutes({
      path: "/entry",
      methods: [apigwv2.HttpMethod.POST],
      integration: new apigwv2Int.HttpLambdaIntegration("CreateEntryIntegration", createEntryFn),
    });

    new cdk.CfnOutput(this, "HttpApiUrl", { value: httpApi.apiEndpoint });
  }
}
