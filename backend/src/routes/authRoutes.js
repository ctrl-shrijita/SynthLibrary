import express from "express";
import {
  login,
  logout,
  me,
  register,
  resendRegistrationOtp,
  verifyRegistrationOtp,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";

export const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/verify-registration-otp", verifyRegistrationOtp);
authRoutes.post("/resend-registration-otp", resendRegistrationOtp);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authRequired, me);
authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password", resetPassword);
