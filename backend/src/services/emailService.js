import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const hasSmtpConfig = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const createTransporter = () =>
  nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

export const sendOtpEmail = async ({ to, name, otp }) => {
  const subject = "Your Digital Library verification code";
  const text = [
    `Hi ${name},`,
    "",
    `Your Digital Library verification code is ${otp}.`,
    `It expires in ${env.otpExpiresMinutes} minutes.`,
    "",
    "If you did not create this account, you can ignore this email."
  ].join("\n");

  if (!hasSmtpConfig) {
    console.log(`[dev email] OTP for ${to}: ${otp}`);
    return;
  }

  await createTransporter().sendMail({
    from: env.mailFrom,
    to,
    subject,
    text
  });
};
