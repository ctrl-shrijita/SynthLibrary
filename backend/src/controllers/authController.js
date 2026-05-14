import bcrypt from "bcryptjs";
import crypto from "crypto";
import dns from "dns/promises";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../services/emailService.js";
import { publicUser } from "../utils.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.cookieSecure,
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const sendToken = (res, user) => {
  const token = jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: "7d"
  });

  res.cookie("token", token, cookieOptions);
  return res.json({ user: publicUser(user) });
};

const normalizeEmail = (email) => email.trim().toLowerCase();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isDeliverableEmail = async (email) => {
  if (!emailPattern.test(email)) return false;

  const domain = email.split("@")[1];
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
};

const hashOtp = (otp) =>
  crypto.createHmac("sha256", env.jwtSecret).update(otp).digest("hex");

const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

const setAndSendOtp = async (user) => {
  const otp = generateOtp();
  user.emailOtpHash = hashOtp(otp);
  user.emailOtpExpiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
  await user.save();
  await sendOtpEmail({ to: user.email, name: user.name, otp });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!(await isDeliverableEmail(normalizedEmail))) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail }).select("+passwordHash +emailOtpHash +emailOtpExpiresAt");
    if (existingUser?.emailVerified) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user =
      existingUser ||
      new User({
        name,
        email: normalizedEmail,
        passwordHash,
        role: "user",
        emailVerified: false
      });

    user.name = name;
    user.passwordHash = passwordHash;
    await setAndSendOtp(user);

    return res.status(201).json({
      message: "Verification code sent to your email",
      requiresOtp: true,
      email: user.email
    });
  } catch (error) {
    next(error);
  }
};

export const verifyRegistrationOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!(await isDeliverableEmail(normalizedEmail))) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+emailOtpHash +emailOtpExpiresAt");
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (user.emailVerified) {
      return sendToken(res, user);
    }

    const isExpired = !user.emailOtpExpiresAt || user.emailOtpExpiresAt.getTime() < Date.now();
    const isMatch = user.emailOtpHash && hashOtp(otp) === user.emailOtpHash;

    if (isExpired || !isMatch) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    user.emailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;
    await user.save();

    return sendToken(res, user);
  } catch (error) {
    next(error);
  }
};

export const resendRegistrationOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select("+emailOtpHash +emailOtpExpiresAt");
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    await setAndSendOtp(user);
    res.json({ message: "Verification code sent to your email" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: normalizeEmail(email) }).select("+passwordHash");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.role === "user" && !user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email before signing in" });
    }

    return sendToken(res, user);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      // Always return success even if user not found to prevent malicious "email enumeration" scanning
      return res.json({ message: "If your email is registered, a reset code has been sent." });
    }

    const otp = generateOtp();
    user.emailOtpHash = hashOtp(otp); // Safely reusing your existing OTP database fields
    user.emailOtpExpiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail({ to: user.email, name: user.name, otp });
    res.json({ message: "If your email is registered, a reset code has been sent." });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, reset code, and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select("+emailOtpHash +emailOtpExpiresAt +passwordHash");
    if (!user) return res.status(400).json({ message: "Invalid request" });

    const isExpired = !user.emailOtpExpiresAt || user.emailOtpExpiresAt.getTime() < Date.now();
    const isMatch = user.emailOtpHash && hashOtp(otp) === user.emailOtpHash;

    if (isExpired || !isMatch) return res.status(400).json({ message: "Invalid or expired reset code" });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password has been successfully reset. You can now log in." });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out" });
};

export const me = (req, res) => {
  res.json({ user: publicUser(req.user) });
};
