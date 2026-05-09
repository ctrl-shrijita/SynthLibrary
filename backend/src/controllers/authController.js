import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { sendOtpEmail } from "../services/emailService.js";
import { publicUser } from "../utils.js";

const cookieOptions = {
  httpOnly: true,
  sameSite: "none",
  secure: env.cookieSecure || process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeEmail = (email) => email.trim().toLowerCase();

const sendToken = (res, user) => {
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: "7d"
    }
  );

  res.cookie("token", token, cookieOptions);

  return res.json({
    user: publicUser(user)
  });
};

const hashOtp = (otp) =>
  crypto.createHmac("sha256", env.jwtSecret).update(otp).digest("hex");

const generateOtp = () =>
  crypto.randomInt(100000, 1000000).toString();

const setAndSendOtp = async (user) => {
  const otp = generateOtp();

  user.emailOtpHash = hashOtp(otp);

  user.emailOtpExpiresAt = new Date(
    Date.now() + env.otpExpiresMinutes * 60 * 1000
  );

  await user.save();

  console.log("Sending OTP to:", user.email);

  await sendOtpEmail({
    to: user.email,
    name: user.name,
    otp
  });

  console.log("OTP email sent successfully");
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters"
      });
    }

    const normalizedEmail = normalizeEmail(email);

    // Check existing user
    const existingUser = await User.findOne({
      email: normalizedEmail
    }).select("+passwordHash +emailOtpHash +emailOtpExpiresAt");

    if (existingUser?.emailVerified) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create or update user
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

    // Send OTP
    await setAndSendOtp(user);

    return res.status(201).json({
      message: "Verification code sent to your email",
      requiresOtp: true,
      email: user.email
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: error.message || "Registration failed"
    });
  }
};

export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and verification code are required"
      });
    }

    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({
      email: normalizedEmail
    }).select("+emailOtpHash +emailOtpExpiresAt");

    if (!user) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    if (user.emailVerified) {
      return sendToken(res, user);
    }

    const isExpired =
      !user.emailOtpExpiresAt ||
      user.emailOtpExpiresAt.getTime() < Date.now();

    const isMatch =
      user.emailOtpHash &&
      hashOtp(otp) === user.emailOtpHash;

    if (isExpired || !isMatch) {
      return res.status(400).json({
        message: "Invalid or expired verification code"
      });
    }

    user.emailVerified = true;
    user.emailOtpHash = undefined;
    user.emailOtpExpiresAt = undefined;

    await user.save();

    return sendToken(res, user);

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      message: error.message || "OTP verification failed"
    });
  }
};

export const resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({
      email: normalizeEmail(email)
    }).select("+emailOtpHash +emailOtpExpiresAt");

    if (!user) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email is already verified"
      });
    }

    await setAndSendOtp(user);

    return res.json({
      message: "Verification code sent to your email"
    });

  } catch (error) {
    console.error("RESEND OTP ERROR:", error);

    return res.status(500).json({
      message: error.message || "Failed to resend OTP"
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: normalizeEmail(email)
    }).select("+passwordHash");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.role === "user" && !user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before signing in"
      });
    }

    return sendToken(res, user);

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: error.message || "Login failed"
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);

  return res.json({
    message: "Logged out"
  });
};

export const me = (req, res) => {
  return res.json({
    user: publicUser(req.user)
  });
};