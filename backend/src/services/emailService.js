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
    `It expires in ${env.otpExpiresMinutes || 15} minutes.`,
    "",
    "If you didn't request this, please ignore this email."
  ].join("\n");

  if (hasSmtpConfig) {
    const transporter = createTransporter();
    await transporter.sendMail({ from: env.smtpUser, to, subject, text });
  }
};

export const sendPasswordResetEmail = async ({ to, name, otp }) => {
  const subject = "Your Digital Library password reset code";
  const text = [
    `Hi ${name},`,
    "",
    `Your password reset code is ${otp}.`,
    `It expires in ${env.otpExpiresMinutes || 15} minutes.`,
    "",
    "If you didn't request this, please ignore this email."
  ].join("\n");

  if (hasSmtpConfig) {
    const transporter = createTransporter();
    await transporter.sendMail({ from: env.smtpUser, to, subject, text });
  }
};