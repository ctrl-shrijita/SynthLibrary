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
    const res = await api.get("/books", { params });
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
      await api.post(`/transactions/borrow/${book._id}`);
      setMessage(`Borrowed ${book.title}`);
      await loadBooks();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-65px)] bg-cover bg-fixed bg-center relative"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/736x/b5/02/2c/b5022c52fcd769592c2cfc8ce49f4ae5.jpg')"
      }}
    >
      <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px]"></div>
      <main className="relative mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700 drop-shadow-sm">Catalog</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 drop-shadow-sm">Browse Books</h1>
          </div>
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Title, author, genre"
                className="w-64 rounded-md border border-slate-300 bg-white/80 py-2 pl-9 pr-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>
            <input
              value={filters.genre}
              onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
              placeholder="Genre"
              className="rounded-md border border-slate-300 bg-white/80 px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
            <label className="inline-flex items-center gap-2 rounded-md bg-white/80 px-3 py-2 text-sm text-slate-700 hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-slate-300">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })}
              />
              Available
            </label>
            <button className="rounded-md bg-slate-950 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition-colors">Search</button>
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
    </div>
  );
}
