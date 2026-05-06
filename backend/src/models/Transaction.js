import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    borrowDate: {
      type: Date,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date,
      default: null
    },
    fine: {
      type: Number,
      default: 0
    },
    fineStatus: {
      type: String,
      enum: ["none", "pending", "paid"],
      default: "none"
    }
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, returnDate: 1 });
transactionSchema.index({ book: 1, borrowDate: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
