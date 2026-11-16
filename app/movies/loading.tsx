export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Movies</h1>
      <p className="mt-2 animate-pulse text-zinc-600 dark:text-zinc-400">
        Loading movies...
      </p>
    </main>
  );
}
