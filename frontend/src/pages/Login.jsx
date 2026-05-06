import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { getErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const user = await login(form);
      navigate(
        location.state?.from?.pathname ||
          (user.role === "admin" ? "/admin/dashboard" : "/user/dashboard")
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <main
      className="min-h-[calc(100vh-65px)] bg-cover bg-center px-4 py-12"
      style={{
        backgroundImage:
          "linear-gradient(rgba(15, 23, 42, 0.68), rgba(15, 23, 42, 0.68)), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80')"
      }}
    >
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_420px]">
        <section className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase text-emerald-300">
            Secure access
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white">
            Sign in to your library workspace
          </h1>

          <p className="mt-4 max-w-xl text-slate-200">
            Admins manage books, borrowing records, and fines. Users browse
            collections, borrow books, and track returns.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-white/20 bg-white/95 p-6 shadow-xl"
        >
          <div className="mb-6 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-950">Login</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <button className="mt-6 w-full rounded-md bg-slate-950 px-4 py-2.5 font-semibold text-white hover:bg-slate-800">
            Sign in
          </button>

          <p className="mt-4 text-sm text-slate-600">
            New here?{" "}
            <Link to="/register" className="font-semibold text-emerald-700">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
