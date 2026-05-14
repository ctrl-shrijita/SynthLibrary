import express from "express";
import { listUsers, updateRole } from "../controllers/userController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

export const userRoutes = express.Router();

// Only admins can view and update users
userRoutes.use(authRequired, requireRole("admin"));
userRoutes.get("/", listUsers);
userRoutes.patch("/:id/role", updateRole);