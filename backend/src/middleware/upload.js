import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: "uploads/pdfs",
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

export const uploadPdf = multer({
  storage,
  fileFilter
});
