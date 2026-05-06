import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    totalCopies: { type: Number, required: true, min: 0 },
    availableCopies: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    publishedYear: { type: Number },
    isFeatured: { type: Boolean, default: false },
    borrowCount: { type: Number, default: 0 },
    pdfUrl: { type: String, default: "" }
  },
  { timestamps: true }
);

bookSchema.index({ title: "text", author: "text", genre: "text" });

export const Book = mongoose.model("Book", bookSchema);
