import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import * as fs from "fs";
import * as path from "path";

const FROM_EMAIL = process.env.FROM_EMAIL || "test@phili-digital.com";
const LANDING_PAGE_URL = process.env.LANDING_PAGE_URL || "https://your-site.vercel.app";
const RECIPIENTS_FILE = process.env.RECIPIENTS_FILE || "./recipients.json";

const ses = new SESClient({ region: process.env.AWS_REGION || "us-east-1" });

interface Recipient {
  email: string;
  firstName?: string;
  lastName?: string;
}

async function sendInvitationEmail(recipient: Recipient) {
  const firstName = recipient.firstName || "Valued Customer";
  
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
              <img src="${LANDING_PAGE_URL}/jpmc-invite-email-hero.png" alt="You're Invited" style="width: 100%; height: auto; display: block;" />
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
                The FIFA World Cup 2026<sup style="font-size: 10px;">TM</sup> in Toronto is ready for you, thanks to Visa. Step into an exclusive, invite-only day filled with premium seating, VIP access, and a custom Match Day Kit.
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                From kickoff to the final whistle, every moment is designed to put you at the heart of the action—it's your front-row seat to history.
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                RSVP today to confirm your attendance.
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 10px 0; font-size: 14px; font-weight: 700; line-height: 1.6;">
                Wednesday, June 17, 2026
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 10px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                FIFA Toronto Stadium (70 Princes' Boulevard, Toronto, ON)
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 10px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                Recommended arrival 1 hour to kick off
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 30px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                Kick off at 7pm ET
              </p>
              
              <!-- RSVP Button -->
              <div style="text-align: center; margin: 0 0 20px 0;">
                <a href="${LANDING_PAGE_URL}" 
                   style="display: inline-block; background-color: #D50101; color: #ffffff; text-decoration: none; padding: 14px 50px; border-radius: 8px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 8px rgba(213, 1, 1, 0.3);">
                  RSVP
                </a>
              </div>
              
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
Hello!

YOU'RE INVITED to FIFA World Cup 26™ thanks to Visa

Bat quunt lahorrum ae runte sequi omnimos aperiaspis rebent occaturi? Ut dolum, voluptat mi, nimusant dolorumque landiti orerupis quiae moluptat cus et, odis aut quibus simusam Lantio rerupis quate sinci harum qui que

RSVP: ${LANDING_PAGE_URL}

Powered by Moneris

---
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
  `.trim();

  const command = new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [recipient.email] },
    Message: {
      Subject: { Data: "You're Invited to FIFA World Cup 26™ thanks to Visa" },
      Body: {
        Html: { Data: htmlBody },
        Text: { Data: textBody },
      },
    },
  });

  try {
    await ses.send(command);
    console.log(`✅ Sent invitation to ${recipient.email}`);
    return { success: true, email: recipient.email };
  } catch (error: any) {
    console.error(`❌ Failed to send to ${recipient.email}:`, error.message);
    return { success: false, email: recipient.email, error: error.message };
  }
}

async function main() {
  console.log("📧 Starting invitation email campaign...\n");

  // Load recipients from JSON file
  const recipientsPath = path.resolve(RECIPIENTS_FILE);
  
  if (!fs.existsSync(recipientsPath)) {
    console.error(`❌ Recipients file not found: ${recipientsPath}`);
    console.log("\nCreate a recipients.json file with this format:");
    console.log(JSON.stringify([
      { email: "user1@example.com", firstName: "John", lastName: "Doe" },
      { email: "user2@example.com", firstName: "Jane", lastName: "Smith" }
    ], null, 2));
    process.exit(1);
  }

  const recipients: Recipient[] = JSON.parse(fs.readFileSync(recipientsPath, "utf-8"));
  
  console.log(`📋 Found ${recipients.length} recipients\n`);
  console.log(`From: ${FROM_EMAIL}`);
  console.log(`Landing Page: ${LANDING_PAGE_URL}\n`);

  const results = {
    total: recipients.length,
    success: 0,
    failed: 0,
    errors: [] as any[],
  };

  // Send emails in batches to avoid rate limits (SES allows ~14 emails/sec)
  const BATCH_SIZE = 10;
  const DELAY_MS = 1000; // 1 second between batches

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);
    console.log(`Sending batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(recipients.length / BATCH_SIZE)}...`);

    const batchResults = await Promise.all(
      batch.map(recipient => sendInvitationEmail(recipient))
    );

    batchResults.forEach(result => {
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ email: result.email, error: result.error });
      }
    });

    // Delay between batches
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 Campaign Results:");
  console.log(`   Total: ${results.total}`);
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  
  if (results.errors.length > 0) {
    console.log("\n❌ Failed emails:");
    results.errors.forEach(err => {
      console.log(`   - ${err.email}: ${err.error}`);
    });
  }
  
  console.log("=".repeat(50));
}

main().catch(console.error);
