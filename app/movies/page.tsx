import type { Metadata } from "next";
import { MovieList } from "@/components/movie-list";
import { getMovies } from "@/lib/movies";

export const metadata: Metadata = {
  title: "Movies",
  description: "The movies you can vote for",
};

export default async function MoviesPage() {
  const movies = await getMovies({ next: { revalidate: 10 } });

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Movies</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Updated periodically from the Movie API
      </p>
      <MovieList movies={movies} />
    </main>
  );
}