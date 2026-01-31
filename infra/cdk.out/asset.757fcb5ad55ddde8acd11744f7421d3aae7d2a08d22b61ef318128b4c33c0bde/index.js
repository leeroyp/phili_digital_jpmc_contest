"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lambda/createEntry.ts
var createEntry_exports = {};
__export(createEntry_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(createEntry_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var import_client_ses = require("@aws-sdk/client-ses");
var import_client_scheduler = require("@aws-sdk/client-scheduler");
var import_crypto = __toESM(require("crypto"));
var TABLE_NAME = process.env.TABLE_NAME;
var FROM_EMAIL = process.env.FROM_EMAIL;
var DEDUPE_SALT = process.env.DEDUPE_SALT;
var SCHEDULE_GROUP = process.env.SCHEDULE_GROUP;
var SCHEDULER_TARGET_ROLE_ARN = process.env.SCHEDULER_TARGET_ROLE_ARN;
var SEND_EMAIL_LAMBDA_ARN = process.env.SEND_EMAIL_LAMBDA_ARN;
var ddb = import_lib_dynamodb.DynamoDBDocumentClient.from(new import_client_dynamodb.DynamoDBClient({}));
var ses = new import_client_ses.SESClient({});
var scheduler = new import_client_scheduler.SchedulerClient({});
function json(statusCode, body) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}
function sha256(input) {
  return import_crypto.default.createHash("sha256").update(input).digest("hex");
}
function normalizeEmail(v) {
  return (v || "").trim().toLowerCase();
}
function normalizePhone(v) {
  return (v || "").replace(/[^\d+]/g, "").trim();
}
function dedupeHash(v) {
  return sha256(`${DEDUPE_SALT}:${v}`);
}
var handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    if (!body.contestId) return json(400, { error: "contestId required" });
    if (!body.drawAtIso) return json(400, { error: "drawAtIso required" });
    if (!body.consent) return json(400, { error: "consent required" });
    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    if (!email) return json(400, { error: "email required" });
    if (!phone) return json(400, { error: "phone required" });
    const drawAt = new Date(body.drawAtIso);
    if (Number.isNaN(drawAt.getTime())) return json(400, { error: "invalid drawAtIso" });
    const reminderAt = body.reminderAtIso ? new Date(body.reminderAtIso) : new Date(drawAt.getTime() - 3 * 864e5);
    const drawDayAt = drawAt;
    const entryId = import_crypto.default.randomUUID();
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const pk = `CONTEST#${body.contestId}`;
    const entrySk = `ENTRY#${entryId}`;
    const emailLockSk = `DEDUPE#EMAIL#${dedupeHash(email)}`;
    const phoneLockSk = `DEDUPE#PHONE#${dedupeHash(phone)}`;
    console.log("[1/4] Writing to DynamoDB...");
    try {
      await ddb.send(new import_lib_dynamodb.TransactWriteCommand({
        TransactItems: [
          { Put: {
            TableName: TABLE_NAME,
            Item: { pk, sk: emailLockSk, type: "dedupe", kind: "email", createdAt: nowIso, entryId },
            ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)"
          } },
          { Put: {
            TableName: TABLE_NAME,
            Item: { pk, sk: phoneLockSk, type: "dedupe", kind: "phone", createdAt: nowIso, entryId },
            ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)"
          } },
          { Put: { TableName: TABLE_NAME, Item: {
            pk,
            sk: entrySk,
            type: "entry",
            contestId: body.contestId,
            entryId,
            createdAt: nowIso,
            locale: body.locale || "en",
            firstName: body.firstName,
            lastName: body.lastName,
            email,
            phone,
            address1: body.address1,
            city: body.city,
            provinceState: body.provinceState,
            postalCode: body.postalCode,
            country: body.country,
            consent: body.consent,
            drawAtIso: drawAt.toISOString(),
            reminderAtIso: reminderAt.toISOString()
          }, ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)" } }
        ]
      }));
    } catch (dbErr) {
      console.error("[1/4] DynamoDB write failed:", dbErr?.message);
      throw dbErr;
    }
    console.log("[1/4] DynamoDB write successful \u2713");
    const locale = body.locale || "en";
    console.log("[2/4] Sending confirmation email via SES...");
    try {
      await ses.send(new import_client_ses.SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: locale === "fr" ? "Confirmation de participation" : "Entry Confirmation" },
          Body: { Text: { Data: locale === "fr" ? "Merci! Votre participation au concours a bien \xE9t\xE9 re\xE7ue." : "Thanks! Your contest entry has been received." } }
        }
      }));
    } catch (sesErr) {
      console.error("[2/4] SES email send failed:", sesErr?.message, sesErr?.code);
      throw sesErr;
    }
    console.log("[2/4] SES email sent \u2713");
    async function scheduleEmail(template, when) {
      const hash = sha256(entryId + template).slice(0, 32);
      const scheduleName = `${template}-${hash}`;
      console.log(`[3/4-${template}] Schedule name: "${scheduleName}" (length: ${scheduleName.length})`);
      if (scheduleName.length > 64) {
        throw new Error(`Schedule name exceeds 64 character limit: ${scheduleName.length} chars: "${scheduleName}"`);
      }
      try {
        console.log(`[3/4-${template}] Creating schedule with Name="${scheduleName}", GroupName="${SCHEDULE_GROUP}"`);
        await scheduler.send(new import_client_scheduler.CreateScheduleCommand({
          Name: scheduleName,
          GroupName: SCHEDULE_GROUP,
          State: "ENABLED",
          FlexibleTimeWindow: { Mode: "OFF" },
          ScheduleExpression: `at(${when.toISOString()})`,
          Target: {
            Arn: SEND_EMAIL_LAMBDA_ARN,
            RoleArn: SCHEDULER_TARGET_ROLE_ARN,
            Input: JSON.stringify({ contestId: body.contestId, entryId, email, locale, template })
          }
        }));
      } catch (schedErr) {
        console.error(`[3/4] Scheduler ${template} schedule failed:`, schedErr?.message, schedErr?.code);
        console.error(`[3/4] Full error:`, JSON.stringify(schedErr, null, 2));
        throw schedErr;
      }
    }
    console.log("[3/4] Creating reminder and draw schedules...");
    await scheduleEmail("reminder", reminderAt);
    await scheduleEmail("draw", drawDayAt);
    console.log("[3/4] Schedules created \u2713");
    console.log("[4/4] Entry created successfully");
    return json(200, { ok: true, entryId });
  } catch (err) {
    const msg = String(err?.name || err?.message || err);
    if (msg.includes("TransactionCanceledException") || msg.includes("ConditionalCheckFailed")) {
      return json(409, { error: "duplicate_entry" });
    }
    const errorContext = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      statusCode: err?.statusCode,
      stack: err?.stack
    };
    console.error("Lambda error:", JSON.stringify(errorContext, null, 2));
    return json(500, { error: "server_error", details: err?.message });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
