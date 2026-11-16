import exercises from "@/data/exercises.json";

export type Exercise = {
  slug: string;
  name: string;
  muscleGroup: string;
  description: string;
};

export async function getExercises(): Promise<Exercise[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return exercises;
}

export async function getExercise(slug: string): Promise<Exercise | undefined> {
  const allExercises = await getExercises();
  return allExercises.find((exercise) => exercise.slug === slug);
}
