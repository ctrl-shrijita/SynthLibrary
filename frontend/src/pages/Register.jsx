import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, UserPlus } from "lucide-react";
import { getErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("register");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register, resendRegistrationOtp, verifyRegistrationOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const data = await register(form);
      setStep("verify");
      setMessage(data.message || "Verification code sent to your email");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const user = await verifyRegistrationOtp({ email: form.email, otp });
      navigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const data = await resendRegistrationOtp({ email: form.email });
      setMessage(data.message || "Verification code sent to your email");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
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
            Join the library
          </p>

          <h1 className="mt-3 text-4xl font-bold text-white">
            Create your digital reading account
          </h1>

          <p className="mt-4 max-w-xl text-slate-200">
            Browse featured books, borrow available copies, track your reading
            history, and return books from your personal dashboard.
          </p>
        </section>

        <form
          onSubmit={step === "register" ? handleSubmit : handleVerify}
          className="w-full rounded-lg border border-white/20 bg-white/95 p-6 shadow-xl"
        >
          <div className="mb-6 flex items-center gap-2">
            {step === "register" ? (
              <UserPlus className="h-5 w-5 text-emerald-600" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            )}
            <h1 className="text-xl font-bold text-slate-950">
              {step === "register" ? "Create Account" : "Verify Email"}
            </h1>
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

          {step === "register" ? (
            <>
              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Name
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>

              <label className="mt-4 grid gap-1 text-sm font-medium text-slate-700">
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
                  minLength="8"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="rounded-md border border-slate-300 px-3 py-2"
                />
              </label>
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-600">
                Enter the 6-digit code sent to {form.email}.
              </p>

              <label className="grid gap-1 text-sm font-medium text-slate-700">
                Verification Code
                <input
                  required
                  inputMode="numeric"
                  maxLength="6"
                  pattern="[0-9]{6}"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="rounded-md border border-slate-300 px-3 py-2 text-center text-lg font-semibold tracking-widest"
                />
              </label>
            </>
          )}

          <button
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-emerald-600 px-4 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Please wait..." : step === "register" ? "Send Verification Code" : "Verify and Continue"}
          </button>

          {step === "verify" && (
            <button
              type="button"
              onClick={handleResend}
              disabled={submitting}
              className="mt-3 w-full rounded-md border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Resend Code
            </button>
          )}

          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
