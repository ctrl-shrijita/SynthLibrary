import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb+srv://shrijita7ghosh_db_user:<nm6YOdLxDpisnbhI>@cluster0.bbmocrh.mongodb.net/?appName=Cluster0",
  jwtSecret: process.env.JWT_SECRET || "development-secret-change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cookieSecure: process.env.COOKIE_SECURE === "true",
  borrowDays: Number(process.env.BORROW_DAYS || 14),
  finePerDay: Number(process.env.FINE_PER_DAY || 1),
  fineBlockThreshold: Number(process.env.FINE_BLOCK_THRESHOLD || 10),
  maxActiveBorrows: Number(process.env.MAX_ACTIVE_BORROWS || 10),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@digital-library.local",
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
  googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY || ""
};
