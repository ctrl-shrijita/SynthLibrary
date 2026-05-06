import express from "express";
import {
  allTransactions,
  borrowBook,
  borrowStats,
  myHistory,
  returnBook
} from "../controllers/transactionController.js";
import { authRequired, requireRole } from "../middleware/auth.js";

export const transactionRoutes = express.Router();

transactionRoutes.post("/borrow/:bookId", authRequired, requireRole("user"), borrowBook);
transactionRoutes.post("/return/:transactionId", authRequired, requireRole("user"), returnBook);
transactionRoutes.get("/my-history", authRequired, requireRole("user"), myHistory);
transactionRoutes.get("/admin/all", authRequired, requireRole("admin"), allTransactions);
transactionRoutes.get("/admin/stats", authRequired, requireRole("admin"), borrowStats);
