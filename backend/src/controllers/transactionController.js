import { env } from "../config/env.js";
import { Book } from "../models/Book.js";
import { Transaction } from "../models/Transaction.js";
import { addDays, calculateFine } from "../utils.js";

const outstandingFineForUser = async (userId) => {
  const [row] = await Transaction.aggregate([
    { $match: { user: userId, fineStatus: "pending" } },
    { $group: { _id: "$user", total: { $sum: "$fine" } } }
  ]);

  return row?.total || 0;
};

export const borrowBook = async (req, res, next) => {
  try {
    const activeBorrows = await Transaction.countDocuments({
      user: req.user._id,
      returnDate: null
    });

    if (activeBorrows >= env.maxActiveBorrows) {
      return res.status(400).json({ message: `Borrow limit reached. Maximum active books: ${env.maxActiveBorrows}` });
    }

    const outstandingFine = await outstandingFineForUser(req.user._id);
    if (outstandingFine > env.fineBlockThreshold) {
      return res.status(400).json({ message: `Borrowing is blocked until fines are at most $${env.fineBlockThreshold}` });
    }

    const alreadyBorrowed = await Transaction.findOne({
      user: req.user._id,
      book: req.params.bookId,
      returnDate: null
    });

    if (alreadyBorrowed) {
      return res.status(400).json({ message: "You already have this book borrowed" });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.availableCopies < 1) return res.status(400).json({ message: "No copies available" });

    const borrowDate = new Date();
    const transaction = await Transaction.create({
      user: req.user._id,
      book: book._id,
      borrowDate,
      dueDate: addDays(borrowDate, env.borrowDays)
    });

    book.availableCopies -= 1;
    book.borrowCount += 1;
    await book.save();

    await transaction.populate("book");
    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const returnBook = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      user: req.user._id
    }).populate("book");

    if (!transaction) return res.status(404).json({ message: "Borrow record not found" });
    if (transaction.returnDate) return res.status(400).json({ message: "This book was already returned" });

    const returnDate = new Date();
    const fine = calculateFine(transaction.dueDate, returnDate);

    transaction.returnDate = returnDate;
    transaction.fine = fine;
    transaction.fineStatus = fine > 0 ? "pending" : "none";
    await transaction.save();

    await Book.findByIdAndUpdate(transaction.book._id, { $inc: { availableCopies: 1 } });

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

export const myHistory = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate("book")
      .sort({ borrowDate: -1 });

    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

export const allTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate("book")
      .populate("user", "name email role")
      .sort({ borrowDate: -1 });

    const fineSummary = await Transaction.aggregate([
      { $match: { fine: { $gt: 0 } } },
      {
        $group: {
          _id: "$fineStatus",
          total: { $sum: "$fine" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ transactions, fineSummary });
  } catch (error) {
    next(error);
  }
};

export const borrowStats = async (req, res, next) => {
  try {
    const period = req.query.period === "week" ? "week" : "day";
    const groupFormat = period === "week" ? "%G-W%V" : "%Y-%m-%d";

    const data = await Transaction.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$borrowDate" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      data: data.map((row) => ({ label: row._id, borrowed: row.count }))
    });
  } catch (error) {
    next(error);
  }
};
