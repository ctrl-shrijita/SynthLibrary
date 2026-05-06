import { BookMarked, Calendar, CheckCircle2, FileText } from "lucide-react";

const fallback =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80";

export default function BookCard({ book, actionLabel, onAction, disabled }) {
  const apiBaseUrl =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  const pdfLink = book.pdfUrl
    ? book.pdfUrl.startsWith("http")
      ? book.pdfUrl
      : `${apiBaseUrl}${book.pdfUrl}`
    : "";

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <img
        src={book.coverUrl || fallback}
        alt={book.title}
        className="h-48 w-full object-cover"
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase text-emerald-700">
            <span>{book.genre}</span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {book.publishedYear || "N/A"}
            </span>
          </div>

          <h3 className="mt-2 text-lg font-bold leading-tight text-slate-950">
            {book.title}
          </h3>

          <p className="text-sm text-slate-600">by {book.author}</p>
        </div>

        <p className="line-clamp-3 text-sm text-slate-600">
          {book.description || "No description provided."}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
            {book.availableCopies > 0 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            ) : (
              <BookMarked className="h-4 w-4 text-slate-400" />
            )}
            {book.availableCopies}/{book.totalCopies} available
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {book.pdfUrl ? (
              <a
                href={pdfLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                Read PDF
              </a>
            ) : null}

            {actionLabel ? (
              <button
                onClick={() => onAction(book)}
                disabled={disabled}
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {actionLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
