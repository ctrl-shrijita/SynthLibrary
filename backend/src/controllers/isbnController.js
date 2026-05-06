// backend/src/controllers/isbnController.js

import { env } from "../config/env.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/isbn/:isbn
// Called by the admin BookForm when the librarian enters an ISBN.
// Tries Open Library first (always free, no key).
// Falls back to Google Books if Open Library returns nothing.
// ─────────────────────────────────────────────────────────────────────────────

export const lookupISBN = async (req, res, next) => {
  try {
    const { isbn } = req.params;

    // Validate: only digits (and optional hyphens), must be 10 or 13 digits total
    const clean = isbn.replace(/-/g, "");
    if (!/^\d{10}$|^\d{13}$/.test(clean)) {
      return res.status(400).json({
        message: "Invalid ISBN. Must be 10 or 13 digits (hyphens are ok).",
      });
    }

    // ── Try 1: Open Library ──────────────────────────────────────────────────
    // Completely free, no API key, returns a JSON keyed by "ISBN:<number>"
    const olResponse = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`
    );
    const olData = await olResponse.json();
    const olBook = olData[`ISBN:${clean}`];

    if (olBook) {
      return res.json(fromOpenLibrary(olBook, clean));
    }

    // ── Try 2: Google Books (fallback) ───────────────────────────────────────
    // Free tier: 1000 requests/day without a key, 1M/day with a key.
    const keyParam = env.googleBooksApiKey
      ? `&key=${env.googleBooksApiKey}`
      : "";
    const gbResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}${keyParam}`
    );
    const gbData = await gbResponse.json();

    if (gbData.totalItems > 0 && gbData.items?.length > 0) {
      return res.json(fromGoogleBooks(gbData.items[0]));
    }

    // ── Nothing found ────────────────────────────────────────────────────────
    return res.status(404).json({
      message: "No book found for that ISBN. Try filling fields manually.",
    });
  } catch (error) {
    next(error); // passes to your existing errorHandler middleware
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers: normalise each API's response into one consistent shape
// ─────────────────────────────────────────────────────────────────────────────

function fromOpenLibrary(book, isbn) {
  const author =
    book.authors?.map((a) => a.name).join(", ") || "Unknown Author";

  // Open Library serves cover images at a predictable URL
  const coverUrl =
    book.cover?.large ||
    book.cover?.medium ||
    book.cover?.small ||
    `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

  const publishedYear = book.publish_date
    ? parseInt(book.publish_date.match(/\d{4}/)?.[0] ?? "0", 10) || undefined
    : undefined;

  // subjects is an array of { name, url } objects
  const genre = book.subjects?.[0]?.name || "General";

  // notes can be a plain string or { type, value }
  const description =
    typeof book.notes === "string"
      ? book.notes
      : book.notes?.value || "";

  return {
    source: "openlibrary",
    isbn,
    title: book.title || "",
    author,
    genre,
    description,
    coverUrl,
    publishedYear,
  };
}

function fromGoogleBooks(item) {
  const info = item.volumeInfo ?? {};
  const author = info.authors?.join(", ") || "Unknown Author";

  // Google Books provides several image sizes; take the largest available
  const img = info.imageLinks ?? {};
  const coverUrl =
    img.extraLarge || img.large || img.medium || img.thumbnail || "";

  const genre = info.categories?.[0] || "General";

  const publishedYear = info.publishedDate
    ? parseInt(info.publishedDate.slice(0, 4), 10) || undefined
    : undefined;

  const isbn13 = info.industryIdentifiers?.find(
    (id) => id.type === "ISBN_13"
  )?.identifier;
  const isbn10 = info.industryIdentifiers?.find(
    (id) => id.type === "ISBN_10"
  )?.identifier;

  return {
    source: "google",
    isbn: isbn13 || isbn10 || "",
    title: info.title || "",
    author,
    genre,
    description: info.description || "",
    coverUrl,
    publishedYear,
  };
}