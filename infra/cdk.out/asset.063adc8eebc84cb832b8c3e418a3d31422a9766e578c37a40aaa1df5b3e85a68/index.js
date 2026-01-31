"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lambda/sendScheduledEmail.ts
var sendScheduledEmail_exports = {};
__export(sendScheduledEmail_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(sendScheduledEmail_exports);
var import_client_ses = require("@aws-sdk/client-ses");
var FROM_EMAIL = process.env.FROM_EMAIL;
var ses = new import_client_ses.SESClient({});
var handler = async (event) => {
  const { email, locale, template } = event;
  const subject = template === "reminder" ? locale === "fr" ? "Rappel du tirage" : "Draw Reminder" : locale === "fr" ? "Jour du tirage" : "Draw Day";
  const body = template === "reminder" ? locale === "fr" ? "Petit rappel : le tirage approche. Bonne chance!" : "Friendly reminder: the draw is coming up soon. Good luck!" : locale === "fr" ? "C\u2019est le jour du tirage! Bonne chance!" : "It\u2019s draw day! Good luck!";
  await ses.send(new import_client_ses.SendEmailCommand({
    Source: FROM_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: { Subject: { Data: subject }, Body: { Text: { Data: body } } }
  }));
  return { ok: true };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
