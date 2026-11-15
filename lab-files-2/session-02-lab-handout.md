# Session 2 lab handout: Routes, layouts and Milestone 1

Full-Stack Frameworks and Server-Side Rendering, EPITA Bachelor in Computer Science, L3

This afternoon you turn Movie Night into a multi-page app in Lab 3. Then you build Milestone 1 on your own project, and submit it before the end of the session.

| Time | Block |
|---|---|
| +0:00 | Lab 3: Routes for Movie Night (75 min) |
| +1:15 | Break (10 min) |
| +1:25 | Milestone 1: work time (70 min) |
| +2:35 | Milestone 1: submission (10 min) |
| +2:45 | Wrap-up and exit quiz (15 min) |

## Before you start

* `movie-night` in the state of the end of Lab 2, with your work committed: `git status` shows nothing left to commit
* Your own project, pushed to your private GitHub repository, with its proposal validated this morning, or at the start of the afternoon if you had to rework it
* Both projects on Next.js 16.4.2: `npx next --version` prints `Next.js v16.4.2`
* The link to the `lab-files` folder of session 2, given by the teacher

Three rules for the whole afternoon:

* Cache Components must stay off. `next.config.ts` must not contain `cacheComponents`.
* `npm run dev` renders every page on every request. To see what is prerendered, run `npm run build`, then `npm start`.
* Navigate with the links of the app when you test a layout. Typing a URL in the address bar loads a new page and resets everything.

| Build output | Meaning |
|---|---|
| `○ (Static)` | Prerendered at build time |
| `● (SSG)` | Prerendered at build time, one page per value returned by `generateStaticParams` |
| `ƒ (Dynamic)` | Rendered on the server for each request |

---

## Lab 3: Routes for Movie Night (75 min)

Goal: turn Movie Night into a multi-page app with a shared navigation, a page per movie, a layout for the movies section, and loading, error and not-found states.

Start from `movie-night` as it was at the end of Lab 2, and copy the code from the `lab-files` folder of session 2. Two checks first:

* `app/movies/page.tsx` contains `export const dynamic = "force-dynamic";` (Lab 2, Part E). If you kept `export const revalidate = 10;` from stretch goal S1, put the `force-dynamic` line back: with `revalidate`, the error test of Part E stops the build.
* If you did not finish Lab 2, first copy the files of the session 1 `lab-files` folder, as its README lists them, then add the `force-dynamic` line.

### Part A: A shared navigation (10 min)

Create `components/nav-link.tsx`. It marks the link of the current page and of its section:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Client Component: usePathname reads the current URL
export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isPage = pathname === href;
  const isInSection = pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isPage ? "page" : isInSection ? "true" : undefined}
      className="hover:underline aria-[current=page]:font-bold aria-[current=true]:font-bold"
    >
      {children}
    </Link>
  );
}
```

Replace the content of `app/layout.tsx`. The header is now on every page, and the title template completes the page titles:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { NavLink } from "@/components/nav-link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Movie Night",
    default: "Movie Night",
  },
  description: "Pick the movie for our next movie night",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b">
          <nav aria-label="Main" className="mx-auto flex w-full max-w-2xl gap-6 p-4">
            <Link href="/" className="font-bold">
              Movie Night
            </Link>
            <NavLink href="/movies">Movies</NavLink>
            <NavLink href="/about">About</NavLink>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
```

The template adds `| Movie Night` to every title, so shorten the titles of two pages:

* In `app/about/page.tsx`: `title: "About",`
* In `app/movies/page.tsx`: `title: "Movies",`

The header replaces the links of the home page: in `app/page.tsx`, remove the `<nav>` element with its two links, and the line `import Link from "next/link";`.

Run `npm run dev`, then open `/movies` and `/about` with the links of the header. The link of the current page is bold, and the tab shows `Movies | Movie Night`. Open the page source of `/movies` and search for `aria-current`.

### Part B: A page per movie (15 min)

Replace the content of `lib/movies.ts`. `getMovie` finds one movie from the id of the URL:

```ts
import movies from "@/data/movies.json";

export type Movie = {
  id: number;
  title: string;
  year: number;
  genre: string;
  minutes: number;
};

// Simulates a slow database query (1 second)
export async function getMovies(): Promise<Movie[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return movies;
}

// The id comes from the URL, so it is a string: "2", not 2
export async function getMovie(id: string): Promise<Movie | undefined> {
  const all = await getMovies();
  return all.find((movie) => String(movie.id) === id);
}
```

Replace the content of `components/movie-list.tsx`. Each title links to its movie page:

```tsx
import Link from "next/link";
import type { Movie } from "@/lib/movies";

export function MovieList({ movies }: { movies: Movie[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {movies.map((movie) => (
        <li key={movie.id} className="rounded border p-4">
          <h2 className="font-semibold">
            <Link href={`/movies/${movie.id}`} className="hover:underline">
              {movie.title} ({movie.year})
            </Link>
          </h2>
          <p className="text-sm">
            {movie.genre} · {movie.minutes} min
          </p>
        </li>
      ))}
    </ul>
  );
}
```

Create `app/movies/[id]/page.tsx`. The folder name has square brackets:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMovie } from "@/lib/movies";

export async function generateMetadata({
  params,
}: PageProps<"/movies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovie(id);
  if (!movie) return {};
  return { title: movie.title };
}

export default async function MoviePage({ params }: PageProps<"/movies/[id]">) {
  const { id } = await params;
  const movie = await getMovie(id);
  if (!movie) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">{movie.title}</h1>
      <p className="mt-2">
        {movie.year} · {movie.genre} · {movie.minutes} min
      </p>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Rendered at {new Date().toISOString()}
      </p>
      <Link href="/movies" className="mt-6 inline-block underline">
        Back to all movies
      </Link>
    </main>
  );
}
```

With `npm run dev` running:

1. Open `/movies` and click Inception: the URL is `/movies/2` and the tab shows `Inception | Movie Night`. The Movies link of the header is still bold: you are in its section.
2. Open `/movies/42`: a 404 page. Open its page source: the HTML is almost empty, because of a known issue of Next.js (vercel/next.js#99793). Part C fixes it.
3. Stop the server and run `npm run build`: the table shows `ƒ /movies/[id]`. Without a list of ids, each movie page is rendered on request.

### Part C: Prerender the movie pages (10 min)

In `app/movies/[id]/page.tsx`, change the import of `@/lib/movies`:

```tsx
import { getMovie, getMovies } from "@/lib/movies";
```

Then add these two exports just above `generateMetadata`:

```tsx
// Only the ids returned by generateStaticParams exist: any other id is a 404
export const dynamicParams = false;

// Runs at build time: one HTML page per movie
export async function generateStaticParams() {
  const movies = await getMovies();
  return movies.map((movie) => ({ id: String(movie.id) }));
}
```

Run `npm run build`, then `npm start`:

1. The table shows `/movies/[id]` with ● lines for `/movies/1`, `/movies/2`, `/movies/3` and `[+3 more paths]`.
2. Open `/movies/2`: it answers at once, and the "Rendered at" time is the time of the build.
3. Open `/movies/42` and its page source: the header and the default 404 page of Next.js, "This page could not be found.", are now in the HTML.

### Part D: A layout for the movies section (15 min)

Create `app/movies/layout.tsx`:

```tsx
// Wraps /movies and every page below it, such as /movies/2.
// It stays on screen, with its state, while you move between them.
export default function MoviesLayout({ children }: LayoutProps<"/movies">) {
  return (
    <>
      <aside aria-label="Notes" className="mx-auto w-full max-w-2xl px-8 pt-6">
        <label className="flex items-center gap-2 text-sm">
          Notes for tonight
          <input type="text" className="rounded border px-2 py-1" />
        </label>
      </aside>
      {children}
    </>
  );
}
```

With `npm run dev`, and using only the links of the pages:

1. On `/movies`, type something in "Notes for tonight".
2. Open a movie, then click "Back to all movies": the text is still there.
3. Open About, then Movies: the text is gone.

Use the links of the app, not the address bar: typing a URL loads a new page and resets everything.

### Part E: Loading, not found and errors (20 min)

Create `app/movies/loading.tsx`:

```tsx
// Shown at once while a page of /movies waits for its data
export default function MoviesLoading() {
  return (
    <p role="status" className="mx-auto w-full max-w-2xl p-8">
      Loading the movies...
    </p>
  );
}
```

Create `app/not-found.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2">This page does not exist.</p>
      <Link href="/movies" className="mt-6 inline-block underline">
        See all movies
      </Link>
    </main>
  );
}
```

Create `app/movies/error.tsx`:

```tsx
"use client"; // Error boundaries must be Client Components

// Do not name this component "Error": it would hide the global Error class
export default function MoviesError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <div role="alert">
        <h1 className="text-2xl font-bold">The movies could not be loaded</h1>
        <p className="mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
      <button type="button" onClick={() => retry()} className="mt-4 rounded border px-4 py-2">
        Try again
      </button>
    </main>
  );
}
```

Test them with `npm run dev`:

1. Open `/movies` from the header: "Loading the movies..." appears for about one second, under the notes field.
2. Open `/movies/42`: your not-found page, with the header, and the tab shows `Page not found | Movie Night`.
3. In `app/movies/page.tsx`, add this line as the first line inside the `MoviesPage` function:

   ```tsx
     throw new Error("Movie database unavailable");
   ```

   Open `/movies`: your error boundary shows "Movie database unavailable". The Next.js error overlay of development may open too: close it to see your page. The notes field is still there, because the layout is outside the error boundary.
4. Stop the server, run `npm run build` and `npm start`, and open `/movies` again: the message is different. Compare with the terminal.
5. Remove the `throw` line.

### Questions

Add your answers to `NOTES.md`, under a new heading "Lab 3":

1. `NavLink` uses `usePathname`, a hook that only works in Client Components. Yet the page source of `/movies/2` already contains `aria-current="true"` on the Movies link. How is this possible?
2. Why does `generateStaticParams` return `String(movie.id)` and not `movie.id`? And why does `/movies/42` give a 404 in Part C without running the code of the page?
3. In Part D, why is the note kept between `/movies` and `/movies/2`, and lost when you go through `/about`?
4. In Part E, step 4, where is the real message of the error, and why does Next.js not send it to the browser?
5. Under `npm run dev`, "Loading the movies..." appears when you open `/movies/2`. Under `npm start` it does not, but it still appears on `/movies`. Why?

### Commit

```bash
git add .
git commit -m "Lab 3: movie pages, layouts, loading, error and not-found"
```

### Stretch goals

* S1, template: with `npm run dev` running, rename `app/movies/layout.tsx` to `app/movies/template.tsx`. Type a note, open a movie, and explain what happens. Rename it back before you build: `LayoutProps<"/movies">` only exists for layouts, so the build fails while the file is a template.
* S2, filter: on `/movies`, add links "All", "Animation", "Sci-Fi"... to `/movies?genre=Sci-Fi`, and show only the movies of that genre. Read `searchParams` in the page.
* S3, route group: move `app/about` into `app/(info)/about`, and add `app/(info)/layout.tsx` with a short text shown above the page. Check that the URL is still `/about`, and read the build output.
* S4, optional catch-all: create `/years/[[...range]]`, where `/years` lists all the movies, `/years/2001` the movies of 2001, and `/years/2001/2010` the movies of that period. Any other value is a 404.
* S5, prefetching: under `npm start`, open the Network tab of DevTools, reload `/movies`, and look for the requests sent before you click anything. Their URL contains `_rsc`. Explain what they are.

### Lab 3 checkpoint

* [ ] The header is on every page, and the link of the current section is bold
* [ ] `/movies/1` to `/movies/6` show one movie each, with its title in the tab
* [ ] The build shows ● for the six movie pages, and `/movies/42` is a 404 with the header
* [ ] The notes field keeps its text between `/movies` and a movie page
* [ ] You saw the loading state, your not-found page and your error boundary
* [ ] `NOTES.md` answers the five questions
* [ ] The work is committed

---

## Milestone 1: Routing and layouts (80 min)

### What to deliver

Milestone 1 counts for 20% of the course grade. Your own project, at the tag `milestone-1`, must have:

* At least three routes from your validated proposal, for example `/`, `/recipes` and `/recipes/[slug]`.
* A shared layout with a navigation, shown on every page.
* At least one dynamic segment (`[slug]`, `[id]`...) that shows one item from your data, and a 404 for unknown values.

There is **no API and no database yet**. Keep your data in a JSON file in `data/`, or in a TypeScript module in `lib/`, as in Movie Night. Use invented sample data, with no real personal information.

### Grading

| Criterion | Points | What the teacher checks |
|---|---|---|
| Routes | 5 | At least three routes that match the validated proposal (3). Each page has its own title (1). No broken internal links (1) |
| Dynamic segment | 5 | At least one `[param]` route that awaits `params` and shows the matching item (2). An unknown value gives a 404, with `notFound()` or `dynamicParams = false` (2). The page title depends on the item, with `generateMetadata` (1) |
| Layout and navigation | 5 | A root layout with a navigation shown on every page (2). Internal links use `<Link>` (1). The current page is marked with `aria-current` (1). A nested layout for one section of the app (1) |
| Special files | 3 | `app/not-found.tsx` (1). A `loading.tsx` for a page that waits for its data, a simulated delay is fine (1). An `error.tsx` with a retry button (1) |
| Code and Git | 2 | `npm run lint` and `npm run build` pass on the tagged commit (1). Several commits that show the progress, and the tag `milestone-1` pushed before the deadline (1) |
| Total | 20 | |

Under `npm start`, `loading.tsx` only appears for a page rendered on request (ƒ). For a prerendered page, the teacher checks it with `npm run dev`.

The teacher grades the tagged commit: `git clone`, `git checkout milestone-1`, `npm ci`, `npm run lint`, `npm run build`, `npm start`. If the build fails, the teacher grades the app with `npm run dev`, and the "Code and Git" criterion gets 0.

### Suggested plan for the work time (70 min)

| Minutes | Work |
|---|---|
| 10 | From your proposal, draw the `app/` folder tree, as in the exercise. Create the data file |
| 25 | The pages, including the dynamic segment with `generateStaticParams`, `notFound()` and `generateMetadata` |
| 15 | The root layout with `NavLink`, and one nested layout |
| 15 | `not-found.tsx`, `loading.tsx`, `error.tsx` |
| 5 | Commit, and check that the build passes |

Commit after each step, not only at the end.

### Submit (10 min)

In your project folder:

```bash
npm run lint
npm run build
git status
git push
git tag -a milestone-1 -m "Milestone 1"
git push origin milestone-1
```

`git status` must show nothing left to commit: the tag points to your last commit, not to the files of your folder. On GitHub, the tag appears in the list of tags of the repository.

To fix something after tagging, before the deadline: commit the fix, push it, then move the tag:

```bash
git tag -a -f milestone-1 -m "Milestone 1"
git push -f origin milestone-1
```

---

## When something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Build fails with `error TS2339: Property 'id' does not exist on type 'Promise<{ id: string; }>'.` | `params` is a Promise | `const { id } = await params;` in an `async` component |
| The editor shows `Cannot find name 'PageProps'` or `Cannot find name 'LayoutProps'` | Next.js has not generated its types yet, for example after a fresh clone | Run `npm run dev` or `npm run build` once, or `npx next typegen` |
| Build fails with `A required parameter (id) was not provided as a string received number in generateStaticParams for /movies/[id]` | `generateStaticParams` returns numbers | Return strings: `{ id: String(movie.id) }` |
| Build fails with `Ambiguous app routes detected:` | Two sibling dynamic folders with different names, such as `[id]` and `[slug]` | Keep one dynamic folder per level, with one name |
| Build fails with `You cannot have two parallel pages that resolve to the same path.` | Two route groups contain the same URL, such as `(info)/about` and `(shop)/about` | Keep each URL in one group only |
| Build fails with ``app/movies/error.tsx must be a Client Component. Add the "use client" directive the top of the file to resolve this issue.`` | `error.tsx` without `"use client"` | Add `"use client";` as the first line |
| Build or overlay error: ``You're importing a module that depends on `usePathname` into a React Server Component module. This API is only available in Client Components.`` | `usePathname` used in a Server Component, such as a layout | Move the code that needs it into a small component that starts with `"use client"` |
| In `error.tsx`, `error TS2339: Property 'message' does not exist on type '{}'.` | The component is named `Error`, which hides the global `Error` class, so `error instanceof Error` checks the wrong thing | Rename the component, for example `MoviesError` |
| Build fails with `error TS2307: Cannot find module '../../../app/.../page.js'` in `.next/dev/types/validator.ts` | A route folder was deleted or renamed while the dev server was stopped, and the generated types still list it | Delete the `.next` folder, then build again |
| Build or editor error `error TS2344: Type '"/movies"' does not satisfy the constraint '"/"'.` | `LayoutProps<"/movies">` is used in a file that is not a layout, such as a `template.tsx`: the type only exists for routes that have a `layout.tsx`. Or the editor checks a new `layout.tsx` before Next.js has generated its types again | For a template: rename the file back to `layout.tsx`, or type its props as `{ children: React.ReactNode }`. For a new layout: run `npm run dev` or `npm run build` once |
| A 404 page has an almost empty page source | `notFound()` in a page rendered on request: known issue vercel/next.js#99793 | Prerender with `generateStaticParams` and `dynamicParams = false`, or check the value in the layout of the segment |
| `notFound()` gives a 200 status | The loading state was already sent, with the status | Check the value before the loading state: `dynamicParams = false`, or a check in the layout of the segment |
| `loading.tsx` never appears under `npm start` | The page is prerendered (○ or ●): there is nothing to wait for | Expected. It appears for pages rendered on request (ƒ), and on every page under `npm run dev` |
| The text of a layout input is lost when changing page | The navigation used an `<a>` tag or the address bar, or the file is a `template.tsx` | Use `<Link>`, and a `layout.tsx` |
| The active link is wrong on a page below the section, or on every page | Comparing `pathname === href` only, or `pathname.startsWith(href)` with `href="/"` | Compare the exact path for "page", and `startsWith(href + "/")` for the section. Do not use `NavLink` for `/`, or use an exact match for it |

The table of the session 1 handout still applies, for example for `npm start` without a build, or a port already in use.
