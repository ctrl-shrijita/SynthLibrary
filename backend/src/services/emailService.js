import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const hasSmtpConfig = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  family: 4 // <--- ADD THIS LINE: Forces Nodemailer to use IPv4
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

  await transporter.sendMail({
    from: env.mailFrom,
    to,
    subject,
    text
  });
};


