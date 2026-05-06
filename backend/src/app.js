// backend/src/app.js
// CHANGES: 2 new lines added (marked with ← NEW)

import express from "express";
import cors from "cors";
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
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: "https://synth-library-git-main-ctrl-shrijitas-projects.vercel.app",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/isbn", isbnRoutes); // ← NEW

app.use(notFound);
app.use(errorHandler);
