import Link from "next/link";
import { Suspense } from "react";
import { TopMovies } from "@/components/top-movies";

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
      <section aria-labelledby="top-3" className="mt-8">
        <h2 id="top-3" className="text-xl font-semibold">
          Tonight&apos;s top 3
        </h2>
        <Suspense
          fallback={
            <p className="mt-3" role="status">
              Counting the votes...
            </p>
          }
        >
          <TopMovies />
        </Suspense>
      </section>
    </main>
  );
}