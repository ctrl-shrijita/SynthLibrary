import { useEffect, useMemo, useState } from "react";
import { BookCheck, Clock, FileText, Sparkles } from "lucide-react";
import { api, getAssetUrl, getErrorMessage } from "../api/client.js";
import BookCard from "../components/BookCard.jsx";
import { formatDate, formatDateTime, money } from "../utils/date.js";

export default function UserDashboard() {
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [featuredRes, trendingRes, recRes, historyRes] = await Promise.all([
      api.get("/books/featured"),
      api.get("/books/trending"),
      api.get("/books/recommendations"),
      api.get("/transactions/my-history")
    ]);
    setFeatured(featuredRes.data.books);
    setTrending(trendingRes.data.books);
    setRecommendations(recRes.data.books);
    setHistory(historyRes.data.transactions);
  };

  useEffect(() => {
    load().catch((err) => setMessage(getErrorMessage(err)));
  }, []);

  const borrow = async (book) => {
    try {
      await api.post(`/transactions/borrow/${book._id}`);
      setMessage(`Borrowed ${book.title}`);
      await load();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const returnBook = async (transaction) => {
    try {
      await api.post(`/transactions/return/${transaction._id}`);
      setMessage(`Returned ${transaction.book?.title}`);
      await load();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const activeBorrows = useMemo(() => history.filter((item) => !item.returnDate), [history]);
  const totalFines = useMemo(
    () => history.filter((item) => item.fineStatus === "pending").reduce((sum, item) => sum + item.fine, 0),
    [history]
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-700">User Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Your Reading Shelf</h1>
        </div>
        {message && <div className="rounded-md bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">{message}</div>}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={<BookCheck />} label="Active Borrows" value={activeBorrows.length} />
        <Metric icon={<Clock />} label="Borrow Limit" value={`${activeBorrows.length}/10`} />
        <Metric icon={<Sparkles />} label="Pending Fines" value={money(totalFines)} />
      </section>

      <section className="mt-8 grid gap-8">
        <BookRow title="Featured Books" books={featured} onBorrow={borrow} />
        <BookRow title="Trending This Month" books={trending} onBorrow={borrow} />
        <BookRow title="Recommended For You" books={recommendations} onBorrow={borrow} />
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-950">Active Borrows</h2>
        </div>
        {activeBorrows.length === 0 ? (
          <div className="p-4">
            <p className="text-sm text-slate-600">No active borrows.</p>
          </div>
        ) : (
          <div className="grid gap-5 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {activeBorrows.map((item) => (
              <div key={item._id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3">
                  <p className="font-semibold text-slate-950 line-clamp-2">{item.book?.title}</p>
                  <p className="text-xs text-slate-600 mt-1">by {item.book?.author}</p>
                </div>
                <div className="mb-4 text-xs text-slate-600">
                  <p>Borrowed {formatDateTime(item.borrowDate)}</p>
                  <p>Due {formatDateTime(item.dueDate)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {item.book?.pdfUrl && (
                    <a
                      href={getAssetUrl(item.book.pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <FileText className="h-4 w-4" />
                      Read PDF
                    </a>
                  )}
                  <button
                    onClick={() => returnBook(item)}
                    className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-bold text-slate-950">Borrowing History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Book</th>
                <th className="px-4 py-3">Borrow Date</th>
                <th className="px-4 py-3">Return Date</th>
                <th className="px-4 py-3">Fine</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-950">{item.book?.title}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(item.borrowDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(item.returnDate)}</td>
                  <td className="px-4 py-3 text-slate-600">{money(item.fine)} {item.fineStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function BookRow({ title, books, onBorrow }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-slate-950">{title}</h2>
      {books.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600">No books to show yet.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              actionLabel="Borrow"
              onAction={onBorrow}
              disabled={book.availableCopies < 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 h-5 w-5 text-emerald-600">{icon}</div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
