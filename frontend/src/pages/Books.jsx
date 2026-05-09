import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api, getErrorMessage } from "../api/client.js";
import BookCard from "../components/BookCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [filters, setFilters] = useState({ search: "", genre: "", availableOnly: true });
  const [message, setMessage] = useState("");

  const loadBooks = async () => {
    const params = {
      search: filters.search || undefined,
      genre: filters.genre || undefined,
      availableOnly: filters.availableOnly ? "true" : undefined
    };
    const res = await api.get("/api/books", { params });
    setBooks(res.data.books);
  };

  useEffect(() => {
    loadBooks().catch((err) => setMessage(getErrorMessage(err)));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    setMessage("");
    loadBooks().catch((err) => setMessage(getErrorMessage(err)));
  };

  const borrow = async (book) => {
    try {
      await api.post(`/api/transactions/borrow/${book._id}`);
      setMessage(`Borrowed ${book.title}`);
      await loadBooks();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700">Catalog</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Browse Books</h1>
        </div>
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Title, author, genre"
              className="w-64 rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3"
            />
          </div>
          <input
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            placeholder="Genre"
            className="rounded-md border border-slate-300 bg-white px-3 py-2"
          />
          <label className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
            />
            Available
          </label>
          <button className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white">Search</button>
        </form>
      </div>

      {message && <div className="mb-5 rounded-md bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">{message}</div>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {books.map((book) => (
          <BookCard
            key={book._id}
            book={book}
            actionLabel={user.role === "user" ? "Borrow" : null}
            onAction={borrow}
            disabled={book.availableCopies < 1}
          />
        ))}
      </div>
    </main>
  );
}
