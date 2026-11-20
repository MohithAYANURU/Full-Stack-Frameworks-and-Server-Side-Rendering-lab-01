"use client"; // Error boundaries must be Client Components

// Do not name this component "Error": it would hide the global Error class
export default function MoviesError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <div role="alert">
        <h1 className="text-2xl font-bold">The movies could not be loaded</h1>
        <p className="mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
      <button type="button" onClick={() => retry()} className="mt-4 rounded border px-4 py-2">
        Try again
      </button>
    </main>
  );
}
