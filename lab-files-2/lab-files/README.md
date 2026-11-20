# Session 2 lab files

The code of Lab 3, as plain files. Copy the code from here rather than from the handout or the slides: copying from a rendered page can break quotes, line breaks and indentation.

The folders match the folders of your `movie-night` project. Copy each file to the same path in your project when the lab asks for it. Start from your project as it was at the end of Lab 2.

## Lab 3

| Part | File in this folder | What to do in your project |
|---|---|---|
| A | `components/nav-link.tsx` | Create `components/nav-link.tsx` |
| A | `app/layout.tsx` | Replace the content of `app/layout.tsx` |
| B | `lib/movies.ts` | Replace the content of `lib/movies.ts` |
| B | `components/movie-list.tsx` | Replace the content of `components/movie-list.tsx` |
| B | `app/movies/[id]/page.tsx` | Create `app/movies/[id]/page.tsx` (the folder name has square brackets) |
| D | `app/movies/layout.tsx` | Create `app/movies/layout.tsx` |
| E | `app/movies/loading.tsx` | Create `app/movies/loading.tsx` |
| E | `app/not-found.tsx` | Create `app/not-found.tsx` |
| E | `app/movies/error.tsx` | Create `app/movies/error.tsx` |

Part A: the header replaces the links of the home page. In `app/page.tsx`, remove the `<nav>` element with its two links, and the line `import Link from "next/link";`.

Part A: the new layout adds `| Movie Night` to every page title. Shorten the titles of two pages, so that they are not written twice:

* In `app/about/page.tsx`: `title: "About",`
* In `app/movies/page.tsx`: `title: "Movies",`

Part C, in `app/movies/[id]/page.tsx`: change the import of `@/lib/movies`, then add the two exports below just above `generateMetadata`.

```tsx
import { getMovie, getMovies } from "@/lib/movies";
```

```tsx
// Only the ids returned by generateStaticParams exist: any other id is a 404
export const dynamicParams = false;

// Runs at build time: one HTML page per movie
export async function generateStaticParams() {
  const movies = await getMovies();
  return movies.map((movie) => ({ id: String(movie.id) }));
}
```

Part E, in `app/movies/page.tsx`: add this line as the first line inside the `MoviesPage` function, test, then remove it.

```tsx
  throw new Error("Movie database unavailable");
```

Stretch goal S1: with `npm run dev` running, rename `app/movies/layout.tsx` to `app/movies/template.tsx`, test, then rename it back before you build.
