import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SchedulerClient, CreateScheduleCommand } from "@aws-sdk/client-scheduler";
import crypto from "crypto";

const TABLE_NAME = process.env.TABLE_NAME!;
const FROM_EMAIL = process.env.FROM_EMAIL!;
const DEDUPE_SALT = process.env.DEDUPE_SALT!;
const SCHEDULE_GROUP = process.env.SCHEDULE_GROUP!;
const SCHEDULER_TARGET_ROLE_ARN = process.env.SCHEDULER_TARGET_ROLE_ARN!;
const SEND_EMAIL_LAMBDA_ARN = process.env.SEND_EMAIL_LAMBDA_ARN!;

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ses = new SESClient({});
const scheduler = new SchedulerClient({});

function json(statusCode: number, body: any) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function normalizeEmail(v: string) {
  return (v || "").trim().toLowerCase();
}

function normalizePhone(v: string) {
  return (v || "").replace(/[^\d+]/g, "").trim();
}

function dedupeHash(v: string) {
  return sha256(`${DEDUPE_SALT}:${v}`);
}

type Body = {
  contestId: string;
  drawAtIso: string;
  reminderAtIso?: string;
  locale?: "en" | "fr";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  provinceState: string;
  postalCode: string;
  country: string;
  consent: boolean;
};

export const handler = async (event: any) => {
  try {
    const body: Body = JSON.parse(event.body || "{}");
    if (!body.contestId) return json(400, { error: "contestId required" });
    if (!body.drawAtIso) return json(400, { error: "drawAtIso required" });
    if (!body.consent) return json(400, { error: "consent required" });

    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    if (!email) return json(400, { error: "email required" });
    if (!phone) return json(400, { error: "phone required" });

    const drawAt = new Date(body.drawAtIso);
    if (Number.isNaN(drawAt.getTime())) return json(400, { error: "invalid drawAtIso" });

    const reminderAt = body.reminderAtIso ? new Date(body.reminderAtIso) : new Date(drawAt.getTime() - 3 * 86400000);
    const drawDayAt = drawAt;

    const entryId = crypto.randomUUID();
    const nowIso = new Date().toISOString();

    const pk = `CONTEST#${body.contestId}`;
    const entrySk = `ENTRY#${entryId}`;
    const emailLockSk = `DEDUPE#EMAIL#${dedupeHash(email)}`;
    const phoneLockSk = `DEDUPE#PHONE#${dedupeHash(phone)}`;

    console.log("[1/4] Writing to DynamoDB...");
    try {
      await ddb.send(new TransactWriteCommand({
        TransactItems: [
          { Put: { TableName: TABLE_NAME, Item: { pk, sk: emailLockSk, type: "dedupe", kind: "email", createdAt: nowIso, entryId },
            ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)" } },
          { Put: { TableName: TABLE_NAME, Item: { pk, sk: phoneLockSk, type: "dedupe", kind: "phone", createdAt: nowIso, entryId },
            ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)" } },
          { Put: { TableName: TABLE_NAME, Item: {
            pk, sk: entrySk, type: "entry", contestId: body.contestId, entryId, createdAt: nowIso, locale: body.locale || "en",
            firstName: body.firstName, lastName: body.lastName, email, phone, address1: body.address1, city: body.city,
            provinceState: body.provinceState, postalCode: body.postalCode, country: body.country, consent: body.consent,
            drawAtIso: drawAt.toISOString(), reminderAtIso: reminderAt.toISOString(),
          }, ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)" } },
        ],
      }));
    } catch (dbErr: any) {
      console.error("[1/4] DynamoDB write failed:", dbErr?.message);
      throw dbErr;
    }
    console.log("[1/4] DynamoDB write successful ✓");

    const locale = body.locale || "en";
    console.log("[2/4] Sending confirmation email via SES...");
    try {
      await ses.send(new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: locale === "fr" ? "Confirmation de participation" : "Entry Confirmation" },
          Body: { Text: { Data: locale === "fr" ? "Merci! Votre participation au concours a bien été reçue." : "Thanks! Your contest entry has been received." } },
        },
      }));
    } catch (sesErr: any) {
      console.error("[2/4] SES email send failed:", sesErr?.message, sesErr?.code);
      throw sesErr;
    }
    console.log("[2/4] SES email sent ✓");

    async function scheduleEmail(template: "reminder" | "draw", when: Date) {
      // Create schedule name under 64 char limit
      // AWS EventBridge Scheduler has 64 char name limit, names should be alphanumeric with - and _
      const hash = sha256(entryId + template).slice(0, 32);
      const scheduleName = `${template}-${hash}`;
      
      console.log(`[3/4-${template}] Schedule name: "${scheduleName}" (length: ${scheduleName.length})`);
      
      // Ensure name is under 64 characters as per AWS EventBridge Scheduler limit
      if (scheduleName.length > 64) {
        throw new Error(`Schedule name exceeds 64 character limit: ${scheduleName.length} chars: "${scheduleName}"`);
      }
      try {
        // Format timestamp without milliseconds or Z: 2026-03-17T20:00:00
        const isoString = when.toISOString();
        const timestamp = isoString.replace(/\.\d{3}Z$/, '');
        const scheduleExpression = `at(${timestamp})`;
        console.log(`[3/4-${template}] Creating schedule with Name="${scheduleName}", Expression="${scheduleExpression}", GroupName="${SCHEDULE_GROUP}"`);
        await scheduler.send(new CreateScheduleCommand({
          Name: scheduleName,
          GroupName: SCHEDULE_GROUP,
          State: "ENABLED",
          FlexibleTimeWindow: { Mode: "OFF" },
          ScheduleExpression: scheduleExpression,
          Target: {
            Arn: SEND_EMAIL_LAMBDA_ARN,
            RoleArn: SCHEDULER_TARGET_ROLE_ARN,
            Input: JSON.stringify({ contestId: body.contestId, entryId, email, locale, template }),
          },
        }));
      } catch (schedErr: any) {
        console.error(`[3/4] Scheduler ${template} schedule failed:`, schedErr?.message, schedErr?.code);
        console.error(`[3/4] Full error:`, JSON.stringify(schedErr, null, 2));
        throw schedErr;
      }
    }

    console.log("[3/4] Creating reminder and draw schedules...");
    await scheduleEmail("reminder", reminderAt);
    await scheduleEmail("draw", drawDayAt);
    console.log("[3/4] Schedules created ✓");

    console.log("[4/4] Entry created successfully");
    return json(200, { ok: true, entryId });
  } catch (err: any) {
    const msg = String(err?.name || err?.message || err);
    if (msg.includes("TransactionCanceledException") || msg.includes("ConditionalCheckFailed")) {
      return json(409, { error: "duplicate_entry" });
    }
    
    // Enhanced error logging to identify where failures occur
    const errorContext = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      statusCode: err?.statusCode,
      stack: err?.stack,
    };
    console.error("Lambda error:", JSON.stringify(errorContext, null, 2));
    
    return json(500, { error: "server_error", details: err?.message });
  }
};
