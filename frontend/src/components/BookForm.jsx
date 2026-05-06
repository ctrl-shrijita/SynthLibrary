// frontend/src/components/BookForm.jsx
// DROP-IN REPLACEMENT for your existing BookForm.jsx
// Same props: { onSubmit }  — AdminDashboard.jsx needs no changes at all.
//
// What's new:
//   • ISBN bar at the top — type an ISBN, click "Lookup", all fields fill in
//   • Cover image preview appears automatically when a coverUrl is present
//   • All existing fields and behaviour are unchanged

import { useState } from "react";
import { PlusCircle, Search, Loader2, X, Book } from "lucide-react";
import { api, getErrorMessage } from "../api/client.js";

// ── Default form state (same fields as before) ────────────────────────────────
const empty = {
  title: "",
  author: "",
  genre: "",
  totalCopies: 1,
  description: "",
  coverUrl: "",
  publishedYear: "",
  isFeatured: false,
  pdf: null,
};

export default function BookForm({ onSubmit }) {
  const [form, setForm] = useState(empty);

  // ISBN lookup state
  const [isbn, setIsbn] = useState("");
  const [lookupState, setLookupState] = useState("idle"); // idle | loading | ok | error
  const [lookupMsg, setLookupMsg] = useState("");

  // ── ISBN lookup handler ───────────────────────────────────────────────────
  const handleLookup = async () => {
    const clean = isbn.replace(/[-\s]/g, "");
    if (!clean) return;

    setLookupState("loading");
    setLookupMsg("");

    try {
      // Calls GET /api/isbn/:isbn on your backend
      const { data } = await api.get(`/isbn/${clean}`);

      // Only overwrite fields that the API actually returned (don't blank anything)
      setForm((prev) => ({
        ...prev,
        title:         data.title        || prev.title,
        author:        data.author       || prev.author,
        genre:         data.genre        || prev.genre,
        description:   data.description  || prev.description,
        coverUrl:      data.coverUrl     || prev.coverUrl,
        publishedYear: data.publishedYear || prev.publishedYear,
      }));

      const source = data.source === "google" ? "Google Books" : "Open Library";
      setLookupState("ok");
      setLookupMsg(`Fields filled from ${source}. Review before saving.`);
    } catch (err) {
      setLookupState("error");
      setLookupMsg(getErrorMessage(err) || "ISBN not found — fill fields manually.");
    }
  };

  const clearLookup = () => {
    setIsbn("");
    setLookupState("idle");
    setLookupMsg("");
  };

  // ── Generic field change (works for text, number, checkbox) ───────────────
  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ── Form submit — builds FormData exactly as before ───────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title",         form.title);
    data.append("author",        form.author);
    data.append("genre",         form.genre);
    data.append("totalCopies",   Number(form.totalCopies));
    data.append("description",   form.description);
    data.append("coverUrl",      form.coverUrl);
    data.append("publishedYear", form.publishedYear);
    data.append("isFeatured",    form.isFeatured);
    if (form.pdf) data.append("pdf", form.pdf);

    await onSubmit(data);

    // Reset everything
    setForm(empty);
    clearLookup();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-lg border border-slate-700 bg-slate-900 p-4"
    >
      <h2 className="text-lg font-semibold text-white">Add Book</h2>

      {/* ── STEP A: ISBN autofill bar ────────────────────────────────────── */}
      <div className="rounded-md border border-slate-600 bg-slate-800 p-3">
        {/* Label */}
        <div className="mb-2 flex items-center gap-1.5">
          <Book className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            ISBN autofill — optional
          </span>
        </div>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleLookup())}
            placeholder="e.g. 9780132350884 or 0-201-61622-X"
            className="flex-1 rounded-md border border-slate-600 bg-slate-950 px-3 py-2
                       text-sm text-white placeholder-slate-500
                       focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="button"
            onClick={handleLookup}
            disabled={lookupState === "loading" || !isbn.trim()}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-2
                       text-sm font-semibold text-white
                       hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {lookupState === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Lookup
          </button>

          {/* Clear button — only shown after a lookup attempt */}
          {lookupState !== "idle" && (
            <button
              type="button"
              onClick={clearLookup}
              title="Clear ISBN"
              className="rounded-md border border-slate-600 px-2 text-slate-400
                         hover:border-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status message */}
        {lookupMsg && (
          <p
            className={`mt-2 text-xs ${
              lookupState === "ok" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {lookupMsg}
          </p>
        )}
      </div>

      {/* ── STEP B: Cover preview (only when a coverUrl exists) ──────────── */}
      {form.coverUrl && (
        <div className="flex items-start gap-3">
          <img
            src={form.coverUrl}
            alt="Cover"
            className="h-24 w-16 flex-shrink-0 rounded object-cover
                       ring-1 ring-slate-600"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <p className="mt-2 text-xs leading-relaxed text-slate-400">
            Cover fetched from Open Library / Google Books.
            <br />
            Replace the URL below if needed.
          </p>
        </div>
      )}

      {/* ── Book fields (identical to original) ─────────────────────────── */}
      <div className="grid gap-3 md:grid-cols-3">
        <input
          name="title"
          value={form.title}
          onChange={update}
          placeholder="Title"
          required
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        />
        <input
          name="author"
          value={form.author}
          onChange={update}
          placeholder="Author"
          required
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        />
        <input
          name="genre"
          value={form.genre}
          onChange={update}
          placeholder="Genre"
          required
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        />
        <input
          name="totalCopies"
          type="number"
          min="0"
          value={form.totalCopies}
          onChange={update}
          placeholder="Total copies"
          required
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        />
        <input
          name="publishedYear"
          type="number"
          value={form.publishedYear}
          onChange={update}
          placeholder="Published year"
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        />
        <input
          name="coverUrl"
          value={form.coverUrl}
          onChange={update}
          placeholder="Cover image URL"
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        />
        <input
          name="pdf"
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setForm((prev) => ({ ...prev, pdf: e.target.files[0] }))
          }
          className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
        />
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={update}
        placeholder="Description"
        rows="3"
        className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white"
      />

      <label className="inline-flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          name="isFeatured"
          checked={form.isFeatured}
          onChange={update}
          className="h-4 w-4"
        />
        Mark as featured
      </label>

      <button
        type="submit"
        className="inline-flex w-fit items-center gap-2 rounded-md
                   bg-emerald-500 px-4 py-2 font-semibold
                   text-slate-950 hover:bg-emerald-400"
      >
        <PlusCircle className="h-4 w-4" />
        Add book
      </button>
    </form>
  );
}
