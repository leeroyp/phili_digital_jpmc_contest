import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const FROM_EMAIL = process.env.FROM_EMAIL!;
const ses = new SESClient({});

type Payload = {
  contestId: string;
  entryId: string;
  email: string;
  locale: "en" | "fr";
  template: "reminder" | "draw";
};

export const handler = async (event: Payload) => {
  const { email, locale, template } = event;

  const subject = template === "reminder"
    ? (locale === "fr" ? "Rappel du tirage" : "Draw Reminder")
    : (locale === "fr" ? "Jour du tirage" : "Draw Day");

  const body = template === "reminder"
    ? (locale === "fr" ? "Petit rappel : le tirage approche. Bonne chance!" : "Friendly reminder: the draw is coming up soon. Good luck!")
    : (locale === "fr" ? "C’est le jour du tirage! Bonne chance!" : "It’s draw day! Good luck!");

  await ses.send(new SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: { Subject: { Data: subject }, Body: { Text: { Data: body } } },
  }));

  return { ok: true };
};
