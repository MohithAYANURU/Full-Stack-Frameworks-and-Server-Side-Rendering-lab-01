"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2">We could not load the movies.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded border px-4 py-2"
      >
        Try again
      </button>
    </main>
  );
}
