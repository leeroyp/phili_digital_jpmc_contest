import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SchedulerClient, CreateScheduleCommand } from "@aws-sdk/client-scheduler";
import crypto from "crypto";

const TABLE_NAME = process.env.TABLE_NAME!;
const FROM_EMAIL = process.env.FROM_EMAIL!;
const LANDING_PAGE_URL = process.env.LANDING_PAGE_URL!;
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
  guestFirstName?: string;
  guestLastName?: string;
  companyName?: string;
  email: string;
  phone: string;
  optIn?: boolean;
};

export const handler = async (event: any) => {
  try {
    const body: Body = JSON.parse(event.body || "{}");
    if (!body.contestId) return json(400, { error: "contestId required" });
    if (!body.drawAtIso) return json(400, { error: "drawAtIso required" });

    const email = normalizeEmail(body.email);
    const phone = normalizePhone(body.phone);
    if (!email) return json(400, { error: "email required" });
    if (!phone) return json(400, { error: "phone required" });

    const drawAt = new Date(body.drawAtIso);
    if (Number.isNaN(drawAt.getTime())) return json(400, { error: "invalid drawAtIso" });

    // For testing: Set reminder to 2 minutes from now
    // For production: Use 3 days before draw
    const reminderAt = body.reminderAtIso 
      ? new Date(body.reminderAtIso) 
      : new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now for testing
      // : new Date(drawAt.getTime() - 3 * 86400000); // 3 days before for production
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
            firstName: body.firstName, lastName: body.lastName, guestFirstName: body.guestFirstName, guestLastName: body.guestLastName,
            companyName: body.companyName, email, phone, optIn: body.optIn || false,
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
      const firstName = body.firstName || "Valued Customer";
      const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Email clients have limited custom font support, using system fonts with proper fallbacks */
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; min-height: 600px;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="650" cellpadding="0" cellspacing="0" style="max-width: 650px; width: 100%; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
          
          <!-- Hero Section with Image -->
          <tr>
            <td style="padding: 0;">
              <img src="${LANDING_PAGE_URL}/jpmc-invite-email-hero.png" alt="You're Registered" style="width: 100%; height: auto; display: block;" />
            </td>
          </tr>

          <!-- White Content Section -->
          <tr>
            <td style="padding: 40px 60px 30px 60px; background-color: #ffffff;">
              
              <!-- Greeting -->
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 16px; font-weight: 400; line-height: 1.5;">
                Hi ${firstName},
              </p>
              
              <!-- Body Copy -->
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                Thank you for registering for the match. We look forward to hosting you at the FIFA World Cup 26<sup style="font-size: 10px;">TM</sup> thanks to Visa.
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                Please note, FIFA World Cup 2026 is a mobile-only entry tournament. Your mobile tickets will not be sent via email. You will have to access them using the FIFA World Cup 2026<sup style="font-size: 10px;">TM</sup> App. Tickets will be sent out 20 days prior to the match. Please see details below for how to register:
              </p>
              
              <ul style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 20px; padding: 0; font-size: 14px; font-weight: 400; line-height: 1.8;">
                <li style="margin-bottom: 8px;">Download the FIFA World Cup 2026<sup style="font-size: 10px;">TM</sup> tournament app from the App Store or Google Play Store.</li>
                <li style="margin-bottom: 8px;">Create an account using the same name and email that you used to register for the match.</li>
                <li style="margin-bottom: 8px;">Follow the on-screen steps to complete your profile.</li>
              </ul>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 30px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                The wait is on; you will receive your FIFA tickets at least 20 days prior to the match.
              </p>
              
              <!-- JPMC Logo -->
              <div style="text-align: center; margin: 20px 0 0 0; padding: 10px 0;">
                <img src="${LANDING_PAGE_URL}/JPMC_Logo_Standard_Black_RGB.png" alt="J.P. Morgan" style="height: 48px; width: auto; display: inline-block;" />
              </div>

            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="padding: 20px 40px 30px 40px; background-color: #ffffff;">
              <p style="color: #666666; font-size: 8px; line-height: 1.3; margin: 0; text-align: left;">
                LIMIT ONE ENTRY PER PERSON DURING THE CONTEST PERIOD. OPEN TO LEGAL RESIDENTS OF THE FIFTY (50) UNITED STATES (INCLUDING THE DISTRICT OF COLUMBIA), WHO AT THE TIME OF ENTRY ARE AT LEAST EIGHTEEN (18) YEARS OLD. CONTEST BEGINS AT 12:00:01 A.M. ET ON JANUARY 1, 2026 AND ENDS AT 11:59:59 P.M. ET ON FEBRUARY 28, 2026. VOID WHERE PROHIBITED. PLEASE SEE OFFICIAL RULES FOR DETAILS, INCLUDING HOW TO ENTER BY ALTERNATE METHOD, ODDS OF WINNING, PRIZE DESCRIPTIONS AND RESTRICTIONS. NO PURCHASE NECESSARY. SPONSOR: VISA INC. For complete contest rules and regulations, visit our website or contact customer service. By entering, you agree to be bound by these official rules and decisions of the Sponsor, which are final and binding in all respects. All federal, state, and local laws and regulations apply.
              </p>
            </td>
          </tr>

          <!-- Decorative Footer with Background -->
          <tr>
            <td style="padding: 0; background-image: url('${LANDING_PAGE_URL}/bg-image.png'); background-size: cover; background-position: center; height: 80px; overflow: hidden;">
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `;

      const textBody = `
Hi ${firstName},

YOU'RE REGISTERED for the FIFA World Cup 2026™ thanks to Visa

Thank you for registering for the match. We look forward to hosting you at the FIFA World Cup 26™ thanks to Visa.

Please note, FIFA World Cup 2026 is a mobile-only entry tournament. Your mobile tickets will not be sent via email. You will have to access them using the FIFA World Cup 2026™ App. Tickets will be sent out 20 days prior to the match. Please see details below for how to register:

- Download the FIFA World Cup 2026™ tournament app from the App Store or Google Play Store.
- Create an account using the same name and email that you used to register for the match.
- Follow the on-screen steps to complete your profile.

The wait is on; you will receive your FIFA tickets at least 20 days prior to the match.

Powered by Moneris
      `.trim();

      await ses.send(new SendEmailCommand({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: locale === "fr" ? "Merci pour votre inscription" : "Thank You for Your Registration" },
          Body: {
            Html: { Data: htmlBody },
            Text: { Data: textBody },
          },
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
            Input: JSON.stringify({ contestId: body.contestId, entryId, email, firstName: body.firstName, locale, template }),
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
