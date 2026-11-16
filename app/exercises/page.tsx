import type { Metadata } from "next";
import { ExerciseList } from "@/components/exercise-list";
import { getExercises } from "@/lib/exercises";

export const metadata: Metadata = {
  title: "Exercises",
  description: "Browse the LiftLog exercise library",
};

export default async function ExercisesPage() {
  const exercises = await getExercises();

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Exercise library</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Choose an exercise to see how it fits into your training.
      </p>
      <ExerciseList exercises={exercises} />
    </main>
  );
}
