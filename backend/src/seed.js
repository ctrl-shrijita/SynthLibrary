import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import { Book } from "./models/Book.js";
import { User } from "./models/User.js";
import { Transaction } from "./models/Transaction.js";

const books = [
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt, David Thomas",
    genre: "Technology",
    totalCopies: 5,
    availableCopies: 5,
    description: "Practical habits and principles for building better software.",
    coverUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    publishedYear: 1999,
    isFeatured: true
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self Improvement",
    totalCopies: 4,
    availableCopies: 4,
    description: "A practical guide to making small changes that compound over time.",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    publishedYear: 2018,
    isFeatured: true
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    totalCopies: 3,
    availableCopies: 3,
    description: "A sweeping desert-world epic of ecology, power, and prophecy.",
    coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
    publishedYear: 1965,
    isFeatured: false
  },
  {
    title: "Beloved",
    author: "Toni Morrison",
    genre: "Literary Fiction",
    totalCopies: 2,
    availableCopies: 2,
    description: "A profound novel about memory, grief, family, and freedom.",
    coverUrl: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=600&q=80",
    publishedYear: 1987,
    isFeatured: true
  }
];

const seed = async () => {
  await connectDB();
  await Promise.all([Book.deleteMany({}), Transaction.deleteMany({}), User.deleteMany({})]);

  const passwordHash = await bcrypt.hash("Password123!", 12);

  await User.insertMany([
    { name: "Library Admin", email: "admin@example.com", passwordHash, role: "admin", emailVerified: true },
    { name: "Demo User", email: "user@example.com", passwordHash, role: "user", emailVerified: true }
  ]);

  await Book.insertMany(books);
  console.log("Seed data created");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
