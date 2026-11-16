import type { ReactNode } from "react";

export default function ExercisesLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <section className="flex-1">{children}</section>;
}
