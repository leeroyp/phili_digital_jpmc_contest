import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const FROM_EMAIL = process.env.FROM_EMAIL!;
const LANDING_PAGE_URL = process.env.LANDING_PAGE_URL!;
const ses = new SESClient({});

type Payload = {
  contestId: string;
  entryId: string;
  email: string;
  firstName?: string;
  locale: "en" | "fr";
  template: "reminder" | "draw";
};

export const handler = async (event: Payload) => {
  const { email, firstName, locale, template } = event;

  const subject = template === "reminder"
    ? (locale === "fr" ? "Rappel du tirage" : "Draw Reminder")
    : (locale === "fr" ? "Jour du tirage" : "Draw Day");

  const heroHeading = template === "reminder"
    ? (locale === "fr" ? "RAPPEL" : "REMINDER")
    : (locale === "fr" ? "AUJOURD'HUI" : "TODAY");

  const heroSubheading = template === "reminder"
    ? (locale === "fr" ? "Le tirage approche" : "The draw is coming up")
    : (locale === "fr" ? "C'est le jour du tirage" : "It's draw day");

  const bodyText = template === "reminder"
    ? (locale === "fr" ? "Petit rappel : le tirage approche. Bonne chance!" : "The countdown is on!")
    : (locale === "fr" ? "C'est le jour du tirage! Bonne chance!" : "It's draw day! Good luck!");

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
              <img src="${LANDING_PAGE_URL}/JPMC_Visa_Invite_Email_Countdown.png" alt="Countdown" style="width: 100%; height: auto; display: block;" />
            </td>
          </tr>

          <!-- White Content Section -->
          <tr>
            <td style="padding: 40px 60px 30px 60px; background-color: #ffffff;">
              
              <!-- Greeting -->
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 16px; font-weight: 400; line-height: 1.5;">
                Hi ${firstName || ''},
              </p>
              
              <!-- Body Copy -->
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                ${bodyText}
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                We're excited to welcome you to witness history at the FIFA World Cup 2026™, thanks to Visa.
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
              
              <!-- JPMC Logo -->
              <div style="text-align: center; margin: 20px 0 0 0; padding: 10px 0;">
                <img src="${LANDING_PAGE_URL}/JPMC_Logo_Standard_Black_RGB.png" alt="J.P. Morgan" style="height: 24px; width: auto; display: inline-block;" />
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
            <td style="padding: 0; background-image: url('${LANDING_PAGE_URL}/jpmc-mobile-hero.png'); background-size: cover; background-position: center; height: 80px; overflow: hidden;">
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const textBody = template === "reminder"
    ? (locale === "fr" ? "Petit rappel : le tirage approche. Bonne chance!" : "Friendly reminder: the draw is coming up soon. Good luck!")
    : (locale === "fr" ? "C'est le jour du tirage! Bonne chance!" : "It's draw day! Good luck!");

  await ses.send(new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: { 
      Subject: { Data: subject }, 
      Body: { 
        Html: { Data: htmlBody },
        Text: { Data: textBody }
      } 
    },
  }));

  return { ok: true };
};
