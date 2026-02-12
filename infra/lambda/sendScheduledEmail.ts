import { Resend } from "resend";

const FROM_EMAIL = process.env.FROM_EMAIL!;
const LANDING_PAGE_URL = process.env.LANDING_PAGE_URL!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const resend = new Resend(RESEND_API_KEY);

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
    ? (locale === "fr" ? "Rappel du tirage" : "Countdown to Kickoff!")
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
                The countdown to kickoff is on! Your opening match day seats at the FIFA World Cup 26<sup style="font-size: 10px;">TM</sup> in Toronto are locked in, thanks to Visa.
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 20px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                Please keep an eye out for your Match Day Kit, arriving ahead of match day. Curated together by Visa and JPMC, this keepsake is designed to kick off the excitement and get you ready to cheer on Canada at the FIFA World Cup 26<sup style="font-size: 10px;">TM</sup>!
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 10px 0; font-size: 14px; font-weight: 700; line-height: 1.6;">
                Friday, June 12, 2026
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 10px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                FIFA Toronto Stadium (70 Princes' Boulevard, Toronto, ON)
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 10px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                Kick off at 3pm ET<br/>
                (Recommended arrival time 90 minutes to kick off)
              </p>
              
              <p style="font-family: Arial, Helvetica, sans-serif; color: #333333; margin: 0 0 30px 0; font-size: 14px; font-weight: 400; line-height: 1.6;">
                We look forward to hosting you!
              </p>

            </td>
          </tr>

          <!-- Legal Footer -->
          <tr>
            <td style="padding: 20px 40px 30px 40px; background-color: #ffffff;">
              <p style="color: #666666; font-size: 8px; line-height: 1.3; margin: 0; text-align: left;">
                © 2025 JPMorgan. All rights reserved.<br/>
                Visa Trademark of Visa Int., used under licence. © 2025 VISA Canada. All rights reserved.<br/>
                FIFA and FIFA World Cup™ are trademarks of FIFA. All rights reserved.
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
    ? (locale === "fr" ? "Petit rappel : le tirage approche. Bonne chance!" : `Hi ${firstName || ''},\n\nThe countdown to kickoff is on! Your opening match day seats at the FIFA World Cup 26™ in Toronto are locked in, thanks to Visa.\n\nPlease keep an eye out for your Match Day Kit, arriving ahead of match day. Curated together by Visa and JPMC, this keepsake is designed to kick off the excitement and get you ready to cheer on Canada at the FIFA World Cup 26™!\n\nFriday, June 12, 2026\nFIFA Toronto Stadium (70 Princes' Boulevard, Toronto, ON)\nKick off at 3pm ET\n(Recommended arrival time 90 minutes to kick off)\n\nWe look forward to hosting you!`)
    : (locale === "fr" ? "C'est le jour du tirage! Bonne chance!" : "It's draw day! Good luck!");

  await resend.emails.send({
    from: FROM_EMAIL,
    to: [email],
    subject: subject,
    html: htmlBody,
    text: textBody,
  });

  return { ok: true };
};
