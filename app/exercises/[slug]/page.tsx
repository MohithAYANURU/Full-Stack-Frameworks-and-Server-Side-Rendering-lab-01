import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExercise, getExercises } from "@/lib/exercises";

type ExercisePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const exercises = await getExercises();
  return exercises.map((exercise) => ({ slug: exercise.slug }));
}

export async function generateMetadata({
  params,
}: ExercisePageProps): Promise<Metadata> {
  const { slug } = await params;
  const exercise = await getExercise(slug);

  return {
    title: exercise?.name ?? "Exercise not found",
  };
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { slug } = await params;
  const exercise = await getExercise(slug);

  if (!exercise) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <Link href="/exercises" className="underline">
        &larr; Back to exercises
      </Link>
      <h1 className="mt-6 text-3xl font-bold">{exercise.name}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Muscle group: {exercise.muscleGroup}
      </p>
      <p className="mt-6">{exercise.description}</p>
    </main>
  );
}
