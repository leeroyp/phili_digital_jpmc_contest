#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ContestStack } from "../lib/contest-stack";

const app = new cdk.App();
new ContestStack(app, "ContestStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || "385487773037",
    region: process.env.CDK_DEFAULT_REGION || "ca-central-1",
  },
});
