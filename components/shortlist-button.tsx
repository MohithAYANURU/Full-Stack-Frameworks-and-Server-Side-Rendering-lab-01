"use client";

import { useState } from "react";

export function ShortlistButton({ movieTitle }: { movieTitle: string }) {
  const [shortlisted, setShortlisted] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={shortlisted}
      onClick={() => setShortlisted(!shortlisted)}
      className="mt-6 rounded border px-4 py-2 font-semibold aria-pressed:bg-zinc-900 aria-pressed:text-white dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
    >
      Shortlist<span className="sr-only"> {movieTitle}</span>
      {shortlisted && <span aria-hidden="true"> ✓</span>}
    </button>
  );
}
