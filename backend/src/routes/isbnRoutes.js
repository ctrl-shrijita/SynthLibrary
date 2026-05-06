// backend/src/routes/isbnRoutes.js

import express from "express";
import { lookupISBN } from "../controllers/isbnController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

export const isbnRoutes = express.Router();

// Only admins can use ISBN lookup — it's part of the "add book" workflow.
// Your existing authRequired + requireRole middleware is reused as-is.
isbnRoutes.get("/:isbn", authRequired, requireRole("admin"), lookupISBN);