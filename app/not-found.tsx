import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Movie not found</h1>
      <p className="mt-2">We could not find the page you requested.</p>
      <Link href="/movies" className="mt-6 inline-block underline">
        Back to movies
      </Link>
    </main>
  );
}
