import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShortlistButton } from "@/components/shortlist-button";
import { getMovie, getMovies } from "@/lib/movies";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

// Only the ids returned by generateStaticParams exist: any other id is a 404
export const dynamicParams = false;

// Runs at build time: one HTML page per movie
export async function generateStaticParams() {
  const movies = await getMovies({ cache: "force-cache" });
  return movies.map((movie) => ({ id: String(movie.id) }));
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovie(id, { cache: "force-cache" });

  return {
    title: movie?.title ?? "Movie not found",
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovie(id, { cache: "force-cache" });

  if (!movie) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <Link href="/movies" className="underline">
        &larr; Back to movies
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{movie.title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        {movie.year} · {movie.genre} · {movie.minutes} min
      </p>
      <ShortlistButton movieTitle={movie.title} />
    </main>
  );
}
