import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, Library, Trash2, UsersRound } from "lucide-react";
import { api, getErrorMessage } from "../api/client.js";
import BookForm from "../components/BookForm.jsx";
import { formatDateTime, money } from "../utils/date.js";

export default function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fineSummary, setFineSummary] = useState([]);
  const [stats, setStats] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const [booksRes, txRes, statsRes] = await Promise.all([
      api.get("/books"),
      api.get("/transactions/admin/all"),
      api.get("/transactions/admin/stats")
    ]);
    setBooks(booksRes.data.books);
    setTransactions(txRes.data.transactions);
    setFineSummary(txRes.data.fineSummary);
    setStats(statsRes.data.data);
  };

  useEffect(() => {
    load().catch((err) => setMessage(getErrorMessage(err)));
  }, []);

  const createBook = async (payload) => {
    try {
      await api.post("/books", payload);
      setMessage("Book added");
      await load();
    } catch (err) {
      const message = getErrorMessage(err);
      setMessage(message);
      console.error("Book creation failed:", err.response?.data || err.message);
    }
  };

  const deleteBook = async (book) => {
    try {
      await api.delete(`/books/${book._id}`);
      setMessage(`Deleted ${book.title}`);
      await load();
    } catch (err) {
      setMessage(getErrorMessage(err));
    }
  };

  const pendingFines = useMemo(
    () => fineSummary.find((item) => item._id === "pending")?.total || 0,
    [fineSummary]
  );

  const activeBorrows = transactions.filter((item) => !item.returnDate).length;

  return (
    <main className="min-h-[calc(100vh-65px)] bg-slate-950 text-slate-100">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-400">Admin Panel</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Library Operations</h1>
          </div>
          {message && <div className="rounded-md border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200">{message}</div>}
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <Metric icon={<Library />} label="Books" value={books.length} />
          <Metric icon={<UsersRound />} label="Active Borrows" value={activeBorrows} />
          <Metric icon={<DollarSign />} label="Pending Fines" value={money(pendingFines)} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <BookForm onSubmit={createBook} />
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-4 text-lg font-semibold text-white">Books Borrowed</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="label" stroke="#cbd5e1" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#cbd5e1" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Bar dataKey="borrowed" fill="#34d399" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-4">
            <h2 className="text-lg font-semibold text-white">Book Inventory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Genre</th>
                  <th className="px-4 py-3">Availability</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id} className="border-t border-slate-800">
                    <td className="px-4 py-3 font-medium text-white">{book.title}</td>
                    <td className="px-4 py-3 text-slate-300">{book.author}</td>
                    <td className="px-4 py-3 text-slate-300">{book.genre}</td>
                    <td className="px-4 py-3 text-slate-300">{book.availableCopies}/{book.totalCopies}</td>
                    <td className="px-4 py-3 text-slate-300">{book.isFeatured ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteBook(book)} className="inline-flex items-center gap-2 rounded-md border border-rose-400/40 px-3 py-1.5 text-rose-200 hover:bg-rose-500/10">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-4">
            <h2 className="text-lg font-semibold text-white">Borrowed Books</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-300">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Book</th>
                  <th className="px-4 py-3">Borrowed</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Returned</th>
                  <th className="px-4 py-3">Fine</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((item) => (
                  <tr key={item._id} className="border-t border-slate-800">
                    <td className="px-4 py-3 text-slate-200">{item.user?.name}<br /><span className="text-xs text-slate-400">{item.user?.email}</span></td>
                    <td className="px-4 py-3 text-slate-200">{item.book?.title}</td>
                    <td className="px-4 py-3 text-slate-300">{formatDateTime(item.borrowDate)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatDateTime(item.dueDate)}</td>
                    <td className="px-4 py-3 text-slate-300">{formatDateTime(item.returnDate)}</td>
                    <td className="px-4 py-3 text-slate-300">{money(item.fine)} {item.fineStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 h-5 w-5 text-emerald-400">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
