import mongoose from "mongoose";
import { Book } from "../models/Book.js";
import { Transaction } from "../models/Transaction.js";

const buildBookQuery = ({ search, title, author, genre, availableOnly }) => {
  const query = {};

  if (search) {
    query.$text = { $search: search };
  }

  if (title) query.title = new RegExp(title, "i");
  if (author) query.author = new RegExp(author, "i");
  if (genre) query.genre = new RegExp(genre, "i");
  if (availableOnly === "true") query.availableCopies = { $gt: 0 };

  return query;
};

export const listBooks = async (req, res, next) => {
  try {
    const query = buildBookQuery(req.query);
    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json({ books });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      genre,
      totalCopies,
      description,
      coverUrl,
      pdfUrl,
      publishedYear,
      isFeatured
    } = req.body;
    const uploadedPdfUrl = req.file ? `/uploads/pdfs/${req.file.filename}` : "";

    if (!title || !author || !genre || totalCopies === undefined) {
      return res.status(400).json({ message: "Title, author, genre, and total copies are required" });
    }

    const book = await Book.create({
      title,
      author,
      genre,
      totalCopies,
      availableCopies: totalCopies,
      description,
      coverUrl,
      pdfUrl: uploadedPdfUrl,
      publishedYear,
      isFeatured
    });

    res.status(201).json({ book });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const activeBorrows = await Transaction.countDocuments({ book: book._id, returnDate: null });

    const updates = { ...req.body };
    if (updates.totalCopies !== undefined) {
      if (updates.totalCopies < activeBorrows) {
        return res.status(400).json({
          message: "Total copies cannot be lower than currently borrowed copies"
        });
      }
      updates.availableCopies = updates.totalCopies - activeBorrows;
    }

    Object.assign(book, updates);
    await book.save();

    res.json({ book });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const activeBorrows = await Transaction.countDocuments({ book: book._id, returnDate: null });
    if (activeBorrows > 0) {
      return res.status(409).json({
        message: "Cannot delete a book with borrowed copies. Wait until all copies are returned."
      });
    }

    await book.deleteOne();
    res.json({ message: "Book deleted" });
  } catch (error) {
    next(error);
  }
};

export const featuredBooks = async (req, res, next) => {
  try {
    const books = await Book.find({ isFeatured: true }).sort({ updatedAt: -1 }).limit(8);
    res.json({ books });
  } catch (error) {
    next(error);
  }
};

export const trendingBooks = async (req, res, next) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const rows = await Transaction.aggregate([
      { $match: { borrowDate: { $gte: since } } },
      { $group: { _id: "$book", borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 8 }
    ]);

    const ids = rows.map((row) => row._id);
    const books = await Book.find({ _id: { $in: ids } });
    const byId = new Map(books.map((book) => [String(book._id), book]));

    res.json({
      books: rows.map((row) => ({
        ...byId.get(String(row._id))?.toObject(),
        recentBorrows: row.borrowCount
      })).filter((book) => book._id)
    });
  } catch (error) {
    next(error);
  }
};

export const recommendations = async (req, res, next) => {
  try {
    const genreRows = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      { $lookup: { from: "books", localField: "book", foreignField: "_id", as: "book" } },
      { $unwind: "$book" },
      { $group: { _id: "$book.genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const genres = genreRows.map((row) => row._id);
    const borrowed = await Transaction.distinct("book", { user: req.user._id });

    const query = genres.length
      ? { genre: { $in: genres }, _id: { $nin: borrowed }, availableCopies: { $gt: 0 } }
      : { availableCopies: { $gt: 0 } };

    const books = await Book.find(query).sort({ borrowCount: -1, createdAt: -1 }).limit(8);
    res.json({ books });
  } catch (error) {
    next(error);
  }
};
