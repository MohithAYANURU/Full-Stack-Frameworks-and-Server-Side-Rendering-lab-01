import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Train smarter with LiftLog</h1>
      <p className="mt-2">
        Keep a simple record of your workouts, sets, and personal records.
      </p>
      <Link href="/exercises" className="mt-6 inline-block underline">
        Browse exercises
      </Link>
    </main>
  );
}