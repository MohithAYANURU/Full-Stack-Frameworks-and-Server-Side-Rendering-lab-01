import Link from "next/link";
import type { Exercise } from "@/lib/exercises";

export function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {exercises.map((exercise) => (
        <li key={exercise.slug} className="rounded border p-4">
          <h2 className="font-semibold">
            <Link href={`/exercises/${exercise.slug}`} className="underline">
              {exercise.name}
            </Link>
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {exercise.muscleGroup}
          </p>
        </li>
      ))}
    </ul>
  );
}
