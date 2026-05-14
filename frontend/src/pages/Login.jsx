import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import { api, getErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [view, setView] = useState("login"); // "login" | "forgot" | "reset"
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const user = await login({ email: form.email, password: form.password });
      navigate(
        location.state?.from?.pathname ||
          (user.role === "admin" ? "/admin/dashboard" : "/user/dashboard")
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await api.post("/auth/forgot-password", { email: form.email });
      setMessage(res.data.message || "Reset code sent.");
      setView("reset");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const res = await api.post("/auth/reset-password", {
        email: form.email,
        otp,
        newPassword
      });
      setMessage(res.data.message || "Password reset successfully. You can now log in.");
      setView("login");
      setForm((prev) => ({ ...prev, password: "" }));
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = view === "login" ? handleLogin : view === "forgot" ? handleForgotPassword : handleResetPassword;

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
          onSubmit={onSubmit}
          className="rounded-lg border border-white/20 bg-white/95 p-6 shadow-xl"
        >
          <div className="mb-6 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-950">
              {view === "login" ? "Login" : view === "forgot" ? "Reset Password" : "New Password"}
            </h2>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          )}

          {view !== "reset" && (
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-md border border-slate-300 px-3 py-2"
                disabled={submitting}
              />
            </label>
          )}

          {view === "login" && (
            <>
              <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setError("");
                      setMessage("");
                    }}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2"
                  disabled={submitting}
                />
              </label>
            </>
          )}

          {view === "reset" && (
            <>
              <p className="mb-4 text-sm text-slate-600">
                Enter the 6-digit code sent to {form.email}.
              </p>

              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Reset Code
                <input
                  required
                  inputMode="numeric"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="rounded-md border border-slate-300 px-3 py-2 text-center text-lg font-semibold tracking-widest"
                  disabled={submitting}
                />
              </label>

              <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
                New Password
                <input
                  type="password"
                  minLength="8"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2"
                  disabled={submitting}
                />
              </label>
            </>
          )}

          <button
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-slate-950 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 disabled:bg-slate-400"
          >
            {submitting
              ? "Please wait..."
              : view === "login"
              ? "Sign in"
              : view === "forgot"
              ? "Send Reset Code"
              : "Reset Password"}
          </button>

          {view === "login" ? (
            <p className="mt-4 text-sm text-slate-600">
              New here?{" "}
              <Link to="/register" className="font-semibold text-emerald-700">
                Create an account
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setError("");
                  setMessage("");
                }}
                className="font-semibold text-emerald-700"
              >
                Back to login
              </button>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
