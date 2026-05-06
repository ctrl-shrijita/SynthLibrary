// import express from "express";
// import {
//   createBook,
//   deleteBook,
//   featuredBooks,
//   listBooks,
//   recommendations,
//   trendingBooks,
//   updateBook
// } from "../controllers/bookController.js";
// import { authRequired, requireRole } from "../middleware/auth.js";
// import { uploadPdf } from "../middleware/upload.js";

// export const bookRoutes = express.Router();

// bookRoutes.get("/featured", authRequired, featuredBooks);
// bookRoutes.get("/trending", authRequired, trendingBooks);
// bookRoutes.get("/recommendations", authRequired, recommendations);
// bookRoutes.get("/", authRequired, listBooks);
// bookRoutes.post("/", authRequired, requireRole("admin"), uploadPdf.single("pdf"), createBook);

// bookRoutes.patch("/:id", authRequired, requireRole("admin"), updateBook);
// bookRoutes.delete("/:id", authRequired, requireRole("admin"), deleteBook);

import express from "express";
import {
  createBook,
  deleteBook,
  featuredBooks,
  listBooks,
  recommendations,
  trendingBooks,
  updateBook
} from "../controllers/bookController.js";
import { authRequired, requireRole } from "../middleware/auth.js";
import { uploadPdf } from "../middleware/upload.js";

export const bookRoutes = express.Router();

bookRoutes.get("/featured", authRequired, featuredBooks);
bookRoutes.get("/trending", authRequired, trendingBooks);
bookRoutes.get("/recommendations", authRequired, recommendations);
bookRoutes.get("/", authRequired, listBooks);
bookRoutes.post("/", authRequired, requireRole("admin"), uploadPdf.single("pdf"), createBook);
bookRoutes.patch("/:id", authRequired, requireRole("admin"), updateBook);
bookRoutes.delete("/:id", authRequired, requireRole("admin"), deleteBook);
