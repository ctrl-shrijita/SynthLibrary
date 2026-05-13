// backend/src/app.js
// CHANGES: 2 new lines added (marked with ← NEW)

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { bookRoutes } from "./routes/bookRoutes.js";
import { transactionRoutes } from "./routes/transactionRoutes.js";
import { isbnRoutes } from "./routes/isbnRoutes.js"; // ← NEW
import { errorHandler, notFound } from "./middleware/errorHandler.js";

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../uploads");

app.use("/uploads", express.static(uploadsDir));

app.set("trust proxy", 1);

app.use(helmet());

const allowedOrigins = [
  env.clientUrl,
  "http://localhost:5173",
  "http://localhost:4173"
];

app.use(cors({
  origin: function(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  "/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/isbn", isbnRoutes); // ← NEW
app.use(notFound);
app.use(errorHandler);
