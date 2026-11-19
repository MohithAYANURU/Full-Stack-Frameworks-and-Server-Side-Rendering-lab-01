# Sessions 5 and 6 lab handout: Lab 4, Movie Night gets its data from an API

Full-Stack Frameworks and Server-Side Rendering, EPITA Bachelor in Computer Science, L3

Lab 4 is split in two guided parts, one after each half of slides. In part 1, Movie Night gets its data from a slow API through a data layer on the server, and you add a Client Component to a prerendered page. In part 2, each page chooses its strategy with the `fetch` options, the home page streams its slow part, and you compare with a page that fetches in the browser.

You follow the steps and write the code that is given. Each part ends with checks: a command or a page, with the result you should get. Lab 4 is not graded: ask the teacher when a check does not give the result.

| Session | Time | Block |
|---|---|---|
| 5 | +0:00 | Slides: Server and Client Components, data in Server Components (90 min) |
| 5 | +1:30 | Break (10 min) |
| 5 | +1:40 | Lab 4, part 1: data layer, `ShortlistButton`, three breaks (80 min) |
| 6 | +0:00 | Slides: parallel requests, streaming, `fetch` options (90 min) |
| 6 | +1:30 | Break (10 min) |
| 6 | +1:40 | Lab 4, part 2: strategies, streaming, CSR comparison (80 min) |

## Before you start

* `movie-night` in the state of the end of Lab 3, with your work committed: `git status` shows nothing left to commit
* The answers of Lab 3 in `NOTES.md`
* Your own project tagged `milestone-1`, with the tag pushed
* Both projects on Next.js 16.4.2: `npx next --version` prints `Next.js v16.4.2`
* Two terminals open side by side in VS Code: one for the API, one for the app
* The link to the `lab-files` folder of session 3, given by the teacher

Three rules for the whole lab:

* Cache Components must stay off. `next.config.ts` must not contain `cacheComponents`.
* `npm run dev` renders every page on every request. To see the strategy of a page, run `npm run build`, then `npm start`, and watch the terminal of the API.
* The API must run during every build and while the app runs. Stop `npm start` with Ctrl+C before each `npm run build`: both use the folder `.next`. On Windows, run the `curl` and `grep` commands in Git Bash.

| Build output | Meaning |
|---|---|
| `○ (Static)` | Prerendered at build time |
| `● (SSG)` | Prerendered at build time, one page per value returned by `generateStaticParams` |
| `ƒ (Dynamic)` | Rendered on the server for each request |

---

## Lab 4, part 1: the data layer and a Client Component (session 5, 80 min)

Goal: move the data of Movie Night behind a slow API, read it on the server, add a Client Component to a prerendered page, and break it on purpose to read the errors.

| Part | What you build | Time |
|---|---|---|
| A | Setup: copy the Movie API, start it in its own terminal | 10 min |
| B | A data layer on the server: `lib/movies.ts` calls the API | 30 min |
| C | A Client Component in a prerendered page: `ShortlistButton` | 15 min |
| D | Break it on purpose: a function prop, server code, a secret | 15 min |
| | Questions in `NOTES.md`, then commit and push | 10 min |

### Part A: Setup (10 min)

Copy the three files of the `lab-files` folder of session 3 to the same paths in your project, as its README says: `api/server.mjs`, `api/data/movies.json` and `api/data/votes.json`. Do not change them.

Add the script to `package.json`, with a comma at the end of the line before it:

```json
    "api": "node api/server.mjs"
```

Check:

* `npm run api`, in the first terminal, prints `Movie API on http://127.0.0.1:4001/api/movies`. Keep it running.
* http://127.0.0.1:4001/api/movies shows the six movies after about one second, and the terminal of the API prints one line for the call.
* The README of `lab-files` describes what each address of the API returns. Read the table: you need it for the next parts.

### Part B: A data layer on the server (30 min)

The pages of Lab 3 read `data/movies.json` through `lib/movies.ts`. Keep the same functions, `getMovies` and `getMovie`, and make them call the API.

**Step 1: the address of the API.** Create `.env.local` at the root of the project:

```bash
MOVIES_API_URL=http://127.0.0.1:4001
```

Check that Git does not track it: `git status` must not list `.env.local`.

**Step 2: rewrite `lib/movies.ts`.** Replace the whole file:

```ts
// Server-only: a Client Component that imports and uses this file fails the build.
// Type imports (import type { Movie }) are fine: they disappear at build.
import "server-only";

export type Movie = {
  id: number;
  title: string;
  year: number;
  genre: string;
  minutes: number;
};

export type Vote = {
  movieId: number;
  count: number;
};

export type VoteResults = {
  votes: Vote[];
  countedAt: string; // ISO 8601
};

// Not prefixed with NEXT_PUBLIC_: only the server can read it.
// Start the API first: npm run api
const API_URL = process.env.MOVIES_API_URL ?? "http://127.0.0.1:4001";

// init: the fetch options chosen by the page, for example { cache: "no-store" }
export async function getMovies(init?: RequestInit): Promise<Movie[]> {
  const res = await fetch(`${API_URL}/api/movies`, init);
  if (!res.ok) throw new Error(`Movie API responded with ${res.status}`);
  return res.json();
}

// The id comes from the URL, so it is a string: "2", not 2
export async function getMovie(
  id: string,
  init?: RequestInit,
): Promise<Movie | undefined> {
  const res = await fetch(`${API_URL}/api/movies/${encodeURIComponent(id)}`, init);
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`Movie API responded with ${res.status}`);
  return res.json();
}

export async function getVotes(init?: RequestInit): Promise<VoteResults> {
  const res = await fetch(`${API_URL}/api/votes`, init);
  if (!res.ok) throw new Error(`Movie API responded with ${res.status}`);
  return res.json();
}
```

What to notice, from the slides of session 5:

* `import "server-only"` makes the build fail if a Client Component uses this file
* `fetch` does not throw for a 404 or a 500: the code checks `res.ok` itself
* `getMovie` returns `undefined` for a 404, so the `notFound()` of Lab 3 keeps working
* Each function takes `init`: the page will choose its `fetch` options in part 2

**Step 3: delete the old data.** Delete the folder `data` and its file `movies.json`: nothing imports it any more. The pages of Lab 3 keep calling `getMovies` and `getMovie` as before.

**Step 4: the build needs the API.**

1. Stop the API (Ctrl+C in the first terminal), then run `npm run build`. It fails. Find these two lines in the output: `connect ECONNREFUSED 127.0.0.1:4001` and `Failed to collect page data for /movies/[id]`. The build calls the API, because `generateStaticParams` and the prerendered pages need the data.
2. Start the API again, then run `npm run build`. It passes. The output lists `- Environments: .env.local`, and the terminal of the API shows 7 calls, all with the user agent `node`.

Check:

* `npm start`, then open `/movies`, `/movies/2` and `/movies/99`: the list, the movie, and the not found page of Lab 3.
* `git status` does not list `.env.local`.

### Part C: A Client Component in a prerendered page (15 min)

Each movie page gets a button to shortlist the movie. The page stays a Server Component, and stays prerendered.

Create `components/shortlist-button.tsx`:

```tsx
"use client"; // State and a click handler: this component must run in the browser

import { useState } from "react";

// A Client Component inside a prerendered page. Only this file is sent to
// the browser as JavaScript; the rest of the movie page is plain HTML.
// Its prop is a string: props from the server must be serializable.
export function ShortlistButton({ movieTitle }: { movieTitle: string }) {
  const [shortlisted, setShortlisted] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={shortlisted}
      onClick={() => setShortlisted(!shortlisted)}
      className="mt-6 rounded border px-4 py-2 font-semibold aria-pressed:bg-zinc-900 aria-pressed:text-white dark:aria-pressed:bg-zinc-100 dark:aria-pressed:text-zinc-900"
    >
      {/* The label stays the same: aria-pressed tells screen readers the state */}
      Shortlist<span className="sr-only"> {movieTitle}</span>
      {shortlisted && <span aria-hidden="true"> ✓</span>}
    </button>
  );
}
```

In `app/movies/[id]/page.tsx`, add the import and render the button above the link back to all movies. The page itself does not get `"use client"`:

```tsx
import { ShortlistButton } from "@/components/shortlist-button";
```

```tsx
      <ShortlistButton movieTitle={movie.title} />
      <Link href="/movies" className="mt-6 block w-fit underline">
        Back to all movies
      </Link>
```

Check, with the API running:

* `npm run build`: the movie pages are still `●`.
* `npm start`, open `/movies/2` and click the button: its look changes, and View Source shows `aria-pressed="false"`, the state of the HTML before any click.
* `curl -s http://localhost:3000/movies/2 | grep -o 'aria-pressed="false"'` prints the attribute.
* In the project folder, `grep -rl "Shortlist" .next/static` prints one file: the JavaScript of your button.
* `grep -rl "127.0.0.1:4001" .next/static` prints nothing: the address of the API is not in the JavaScript sent to the browser.

Commit now: `git add .` then `git commit -m "Lab 4 part 1: data layer and ShortlistButton"`. The next part breaks the code on purpose, and you will go back to this commit.

### Part D: Break it on purpose (15 min)

Three breaks, each on the commit above. For each one: make the change, run `npm run build`, read the error, then undo it before the next break. Stop `npm start` first.

**Break 1: a function as a prop.**

1. In `shortlist-button.tsx`, change the props to `{ movieTitle, onToggle }: { movieTitle: string; onToggle?: () => void }`.
2. In `app/movies/[id]/page.tsx`, render `<ShortlistButton movieTitle={movie.title} onToggle={() => {}} />`.
3. `npm run build` fails with `Error: Event handlers cannot be passed to Client Component props.`
4. Undo: `git restore app components`.

Why: the props are written into the RSC payload, which is data. A function is code and cannot be written into it.

**Break 2: server code in a Client Component.**

1. In `shortlist-button.tsx`, add `import { getMovies } from "@/lib/movies";` and call it in the click handler: `onClick={() => { getMovies(); setShortlisted(!shortlisted); }}`.
2. `npm run build` fails with two errors. One says `You're importing a module that depends on "server-only"` and wrongly mentions the Pages Router. The other one gives the real cause: `'server-only' cannot be imported from a Client Component module`.
3. Try again with only the `import`, without the call: the build passes, because an unused import is dropped.
4. Undo: `git restore app components`.

**Break 3: a secret in a Client Component.**

1. Add `MOVIES_API_KEY=abc123` to `.env.local`.
2. In `shortlist-button.tsx`, render `<p>Key: {process.env.MOVIES_API_KEY}</p>` under the button, "to check that it is set".
3. `npm run build` passes: there is no error. Look for the value:
   * `grep -rl "abc123" .next/static` prints nothing: it is not in the JavaScript
   * `grep -rl "abc123" .next/server/app/movies` prints the movie pages: it is in the HTML
4. Undo: `git restore app components`, and delete the `MOVIES_API_KEY` line of `.env.local`. Build once more.

Why: a Client Component is also rendered on the server, where every variable of `.env.local` exists. The value is written into the HTML that every visitor receives.

### Questions

Answer in `NOTES.md`, in a section "Lab 4, part 1", in a few sentences each:

1. After `npm run build` with the API running, the terminal of the API shows 7 calls. Which calls are they? `generateMetadata` and the page of a movie both call `getMovie`: why does the API receive only one call for each movie?
2. In break 3, where did the value of `MOVIES_API_KEY` end up, who can read it, and where should the key be used instead?
3. Explain in your own words why Next.js refuses a function as a prop (break 1) and a `server-only` import in a Client Component (break 2).

### Commit

```bash
git status
git add .
git commit -m "Lab 4 part 1: NOTES"
git push
```

`git status` must not list `.env.local`.

### Lab 4, part 1 checkpoint

* `lib/movies.ts` starts with `import "server-only"` and calls the API, with `res.ok` checked
* `.env.local` is not tracked, and `data/movies.json` is deleted
* `ShortlistButton` is a Client Component, and the movie pages are still `●`
* The three breaks are undone, and the build passes
* The questions of part 1 are in `NOTES.md`

---

## Lab 4, part 2: strategies, streaming and the browser (session 6, 80 min)

Goal: choose a strategy for each page with the `fetch` options, stream the slow part of the home page, compare with a page that fetches in the browser, and see what each page does when the API is down.

Start from your project at the end of part 1, with the API running and `git status` clean.

| Part | What you build | Time |
|---|---|---|
| E | One strategy per page: ISR for `/movies`, SSG for `/movies/[id]` | 20 min |
| F | The home page: SSR, `Promise.all` and `<Suspense>` | 20 min |
| G | The same list, fetched by the browser: `/movies-client` | 15 min |
| H | Stop the API, and observe each page | 15 min |
| | Questions in `NOTES.md`, then commit and push | 10 min |

Which `fetch` option gives which strategy, measured with `npm run build`, then three requests to each page under `npm start`, and three under `npm run dev`. Each page made one `fetch`:

| `fetch` option | Build output | Calls during the build | Calls for 3 requests, `npm start` | Calls for 3 requests, `npm run dev` |
|---|---|---|---|---|
| None, in a static page | ○ | 1 | 0 | 3 |
| None, in a page that reads `searchParams` | ƒ | 0 | 3 | 3 |
| `cache: "no-store"` | ƒ | 0 | 3 | 3 |
| `cache: "force-cache"` | ○ | 1 | 0 | 1 |
| `next: { revalidate: 10 }` | ○, with `10s` in the Revalidate column | 1 | At most 1 every 10 s, after a request | 1 |

Under `npm start`, a prerendered page answers in a few milliseconds, with the header `x-nextjs-cache: HIT`. With `revalidate`, the first request after the period still receives the old page, with `x-nextjs-cache: STALE`, and starts the regeneration in the background: the next request receives the new page. A dynamic page has no `x-nextjs-cache` header.

### Part E: One strategy per page (20 min)

Each page chooses its strategy with the options it passes to the data layer. Do not use `export const dynamic` or `export const revalidate`.

**Step 1: predict.** In `NOTES.md`, start a section "Lab 4, part 2" with a table, and fill the last column now, before you build:

| Page | `fetch` option | Build output you expect |
|---|---|---|
| `/movies` | `next: { revalidate: 10 }` | |
| `/movies/[id]` | `cache: "force-cache"` | |

**Step 2: `/movies` is ISR.** In `app/movies/page.tsx`, delete the line `export const dynamic = "force-dynamic";` of Lab 3, and pass the option to the data layer:

```tsx
// ISR: prerendered at build time, then regenerated in the background at most
// every 10 seconds, after a request (○ with "10s" in the build output)
const movies = await getMovies({ next: { revalidate: 10 } });
```

**Step 3: `/movies/[id]` is SSG.** In `app/movies/[id]/page.tsx`, the three functions that fetch ask for a cached response:

```tsx
export async function generateStaticParams() {
  const movies = await getMovies({ cache: "force-cache" });
  return movies.map((movie) => ({ id: String(movie.id) }));
}
```

```tsx
  // in generateMetadata, and in the page: the same URL and the same options
  const movie = await getMovie(id, { cache: "force-cache" });
```

With the same URL and options, Next.js sends one request for `generateMetadata` and the page.

**Step 4: build with an empty cache.** Next.js keeps the cached responses in `.next/cache`, and a build reuses them. Delete the cache first, with the API running:

```bash
rm -rf .next/cache
npm run build
```

Check:

* The build output contains `○ /movies` with `10s` and `1y` in its line, and `● /movies/1`. Compare with your predictions.
* The terminal of the API shows 8 calls: `/api/movies` twice (once for `generateStaticParams`, once for the page `/movies`, with different options), then one call per movie.
* Build again **without** `rm -rf .next/cache`: the API receives fewer calls, because the responses cached by the previous build are reused.

**Step 5: watch the calls under `npm start`.**

* Reload `/movies/2` three times: the terminal of the API shows no call.
* Run the command below, then again after 10 seconds, and watch the terminal of the API:

```bash
curl -s -o /dev/null -D - http://localhost:3000/movies | grep -i x-nextjs-cache
```

It prints `x-nextjs-cache: HIT` or `x-nextjs-cache: STALE`. After 10 seconds, the first request gets `STALE` and starts one call to the API, and the next one gets `HIT` with the new page.

**Step 6: the `force-dynamic` trap.** Put `export const dynamic = "force-dynamic";` back in `app/movies/page.tsx`, stop `npm start`, delete `.next/cache`, and build. The output now says `ƒ /movies`, but the page still passes `revalidate: 10`: reload it and watch the API, it is still called at most every 10 seconds. The build output says ƒ, and the data can be old. Delete the line again, and build once more.

Commit: `git add .` then `git commit -m "Lab 4 part 2: one strategy per page"`.

### Part F: The home page, SSR and streaming (20 min)

The home page shows the top 3 movies of tonight, with live votes. The votes change all the time, so they are never cached. The API answers `/api/movies` in 1 s and `/api/votes` in 1.5 s: the title of the page must not wait for them. You build it in three steps and time each one.

**Step 1: the component, written the slow way.** Create `components/top-movies.tsx`:

```tsx
import Link from "next/link";
import { getMovies, getVotes } from "@/lib/movies";

// Fixed locale and time zone: the output does not depend on the machine
const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeStyle: "medium",
  timeZone: "Europe/Paris",
});

// Async Server Component: it fetches its own data on the server, without
// useEffect. No cache: the votes change all the time.
export async function TopMovies() {
  // One request after the other: 1 s + 1.5 s = 2.5 s
  const movies = await getMovies({ cache: "no-store" });
  const { votes, countedAt } = await getVotes({ cache: "no-store" });

  const top = [...votes].sort((a, b) => b.count - a.count).slice(0, 3);

  return (
    <>
      <ol className="mt-3 list-decimal space-y-1 pl-6">
        {top.map((vote) => (
          <li key={vote.movieId}>
            <Link href={`/movies/${vote.movieId}`} className="underline underline-offset-4">
              {movies.find((movie) => movie.id === vote.movieId)?.title}
            </Link>
            : {vote.count} votes
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Votes counted at {timeFormat.format(new Date(countedAt))}
      </p>
    </>
  );
}
```

Use it in `app/page.tsx`, **without** `<Suspense>`: keep your title and your text, and add a section after them:

```tsx
import { TopMovies } from "@/components/top-movies";
```

```tsx
      <section aria-labelledby="top-3" className="mt-8">
        <h2 id="top-3" className="text-xl font-semibold">
          Tonight&apos;s top 3
        </h2>
        <TopMovies />
      </section>
```

Build and start, then time the page. The first number is the first byte, the second one the whole page:

```bash
curl -s -o /dev/null -w "%{time_starttransfer} %{time_total}\n" http://localhost:3000/
```

Expected: the build output shows `ƒ /`, and the two numbers are both about 2.5. The page sends nothing before its data is there. Write the two numbers in `NOTES.md`.

**Step 2: stream the slow part.** Wrap the component in `<Suspense>`. The heading stays outside:

```tsx
import { Suspense } from "react";
```

```tsx
        {/* Streaming: the server sends the page and the fallback at once,
            then the list when TopMovies has its data */}
        <Suspense fallback={<p className="mt-3" role="status">Counting the votes...</p>}>
          <TopMovies />
        </Suspense>
```

Build, start, and time it again. Expected: a first byte below 0.1 s, and a total of about 2.5 s. Also check that the fallback is in the HTML, followed later in the same response by the list:

```bash
curl -s http://localhost:3000/ | grep -c "Counting the votes"
```

It prints `1`.

**Step 3: start the two requests together.** They do not depend on each other. In `TopMovies`, replace the two `await` lines:

```tsx
  // The two requests do not depend on each other: start them together.
  // One after the other: 1 s + 1.5 s = 2.5 s. Together: 1.5 s.
  const [movies, { votes, countedAt }] = await Promise.all([
    getMovies({ cache: "no-store" }),
    getVotes({ cache: "no-store" }),
  ]);
```

Build, start, and time it a third time. Expected: first byte below 0.1 s, total about 1.5 s. Each request to `/` makes 2 calls in the terminal of the API.

Commit: `git add .` then `git commit -m "Lab 4 part 2: home page with streaming"`.

### Part G: The same list, fetched by the browser (15 min)

`/movies-client` gets the movies from the Movie API, from the browser, so that you can compare it with `/movies`.

**Step 1: the address.** The browser needs its own variable: only `NEXT_PUBLIC_` variables are copied into the JavaScript of the browser. Add to `.env.local`:

```bash
NEXT_PUBLIC_MOVIES_API_URL=http://127.0.0.1:4001
```

**Step 2: the page.** Replace `app/movies-client/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { MovieList } from "@/components/movie-list";
import type { Movie } from "@/lib/movies";

// NEXT_PUBLIC_: the value is copied into the JavaScript sent to the browser.
// It is public: never put a secret in a NEXT_PUBLIC_ variable.
const API_URL = process.env.NEXT_PUBLIC_MOVIES_API_URL ?? "http://127.0.0.1:4001";

export default function MoviesClientPage() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Runs in the browser, after the page has loaded. The request goes from
    // the browser to the API: the API must allow this origin (CORS).
    fetch(`${API_URL}/api/movies`)
      .then((res) => {
        if (!res.ok) throw new Error(`Movie API responded with ${res.status}`);
        return res.json();
      })
      .then((data: Movie[]) => setMovies(data))
      .catch(() => setFailed(true));
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="text-3xl font-bold">Movies (client-rendered)</h1>
      {failed ? (
        <p className="mt-6" role="alert">
          The movies could not be loaded. Is the Movie API running?
        </p>
      ) : movies === null ? (
        <p className="mt-6" role="status">
          Loading movies...
        </p>
      ) : (
        <MovieList movies={movies} />
      )}
    </main>
  );
}
```

The page may only import the **type** `Movie` from `lib/movies.ts`, with `import type`: a function import would break the build, because that file is `server-only`. Delete `public/movies.json`: nothing uses it any more.

Check:

* `npm run build` passes. If it fails with an error about `server-only`, the page imports and calls a function of `lib/movies.ts`.
* `npm start`, open `/movies-client` in the browser: "Loading movies..." then the list. The terminal of the API shows a call with a user agent that starts with `Mozilla/5.0`. Open `/movies`: no call, or one with the user agent `node`.
* View Source of `/movies-client` contains "Loading movies..." and none of the titles. View Source of `/movies` contains the titles.
* `grep -rl "127.0.0.1:4001" .next/static` now prints one file: everything in a `NEXT_PUBLIC_` variable is copied into the JavaScript sent to the browser.

Commit: `git add .` then `git commit -m "Lab 4 part 2: client-side comparison"`.

### Part H: When the API is down (15 min)

With `npm start` running, stop the API (Ctrl+C in its terminal). Reload each page, and fill the table in `NOTES.md` with what you see:

| Page | What you see | Why, with the strategy of the page |
|---|---|---|
| `/movies` | | |
| `/movies/2` | | |
| `/` | | |
| `/movies-client` | | |

Look at the terminal of the app too. Then try a build with the API still stopped: it fails, and you know why. Start the API again.

Expected, to compare after you wrote your own answers:

* `/movies` and `/movies/2` still work: they were generated during the build, and the last good version is served
* `/` shows its title and "Counting the votes...", then the list fails. The terminal of the app shows `⨯ [TypeError: fetch failed]`. The status code was 200, sent with the first byte
* `/movies-client` shows "Loading movies...", then the error message

### Questions

Answer in `NOTES.md`, in the section "Lab 4, part 2", in a few sentences each:

1. Complete the table of part E: each page of Movie Night, its strategy (SSG, ISR, SSR or CSR) and why this strategy fits the page. Add the real build output next to your predictions.
2. After `rm -rf .next/cache`, the build makes 8 calls to the API. Which calls are they?
3. The home page took about 2.5 s without `<Suspense>`, then 2.5 s with it, then 1.5 s with `Promise.all`. What does each change improve: the first byte, the total, or both? Why?
4. The table of part H, complete.

### Commit

```bash
git status
git add .
git commit -m "Lab 4 part 2: NOTES"
git push
```

`git status` must not list `.env.local`.

### Lab 4 checkpoint

* `/movies` is `○` with `10s`, the movie pages are `●`, and `export const dynamic` is gone
* The home page is `ƒ`, with the heading outside `<Suspense>` and the two requests in `Promise.all`
* `/movies-client` fetches in the browser, and `public/movies.json` is deleted
* The questions of the two parts are in `NOTES.md`, and everything is pushed

---


## When something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Build or overlay error: ``You're importing a module that depends on `useState` into a React Server Component module. This API is only available in Client Components.`` | Hooks used in a Server Component | Add `"use client"` at the top of the file, as low as possible in the tree |
| Build fails with `Error: Event handlers cannot be passed to Client Component props.`, followed by the props, such as `{movieTitle: ..., onToggle: function onToggle}` | A Server Component passes a function to a Client Component, with a name that starts with `on` and a capital letter, or puts `onClick` on an element | Write the handler inside the Client Component, and pass it data only |
| Build fails with `Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".` | A Server Component passes a function with another name, such as `format` | Pass the data, and call the function in the Server Component or inside the Client Component |
| Build fails with `Error: Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.` | A prop is an instance of a class | Pass a plain object with the fields the Client Component needs |
| In a page rendered on request (ƒ), the build passes, but each request answers 500 with one of the three errors above in the terminal | The props are only checked when the page is rendered, on each request for a dynamic page | Same fixes. Prerendered pages (○, ●) show the error during the build |
| Build fails with `Error: Turbopack build failed with 2 errors:`, `You're importing a module that depends on "server-only"` and `'server-only' cannot be imported from a Client Component module` | A Client Component imports and uses a file that starts with `import "server-only"`, directly or through another file. The first message wrongly mentions the Pages Router | Fetch the data in a Server Component and pass it as props. `import type` from that file is fine |
| TypeScript error `Property 'onToggle' does not exist on type 'IntrinsicAttributes & { movieTitle: string; }'` | The component receives a prop that its props type does not declare | Declare the prop in the type, or remove it. A function prop still fails at the boundary |
| No error, but the value of a secret is in the HTML of the page | A Client Component reads a variable without `NEXT_PUBLIC_`: it is rendered on the server too, where every variable exists | Read secrets only in a module that starts with `import "server-only"` |
| A `NEXT_PUBLIC_` variable keeps its old value after a change in `.env.local` | Its value is copied into the browser JavaScript during the build | Build again |
| Build fails with `[TypeError: fetch failed]`, `connect ECONNREFUSED 127.0.0.1:4001`, then `Failed to collect page data for /movies/[id]` or `Export encountered an error on ...` | The API is not running, and a page or `generateStaticParams` fetches during the build | Start the API with `npm run api` before `npm run build` |
| `connect ECONNREFUSED` while the API is running | Wrong port in `.env.local` or in the default address, or the API listens on `localhost`, which can mean only the IPv6 address `::1` | Use the same address in the API and in the data layer: `127.0.0.1` and the right port |
| A page shows 500 when the API is stopped | The page fetches on each request (`no-store`), and nothing was sent before the error | Add `error.tsx`, and a `<Suspense>` or `loading.tsx` boundary: the page then answers 200 and shows the error boundary |
| The terminal shows `⨯ [TypeError: fetch failed]`, but the browser only gets a generic error | Expected: in production, the HTML only carries the digest of the error | Read the terminal of the app, and keep the message of `error.tsx` generic |
| A page with `next: { revalidate: 10 }` is ƒ, and "Rendered at" changes on each reload | `export const dynamic = "force-dynamic"` is still in the file | Delete the line: the page becomes ○ with `10s` |
| After a change in the data and a new build, a page still shows the old data | The response was cached with `force-cache`, or without options in a static page, and the build reused it from `.next/cache` | Delete `.next/cache`, then build again |
| An ISR page shows old data on the first reload after the period, with `x-nextjs-cache: STALE` | Expected: that request starts the regeneration in the background | Reload again: the next request gets the new page |
| `npm run dev` prints `⚠ Specified "cache: no-store" and "revalidate: 10", only one should be specified.` | The two options conflict, so Next.js ignores both | Keep one of them |
| Under `npm run dev`, a page does not show the new data of the API | In development, the responses of `force-cache` and `revalidate` are cached too | Hard refresh, or check "Disable cache" in DevTools. Check strategies with `npm run build` and `npm start` |
| `/movies-client` shows "The movies could not be loaded. Is the Movie API running?" | The API is stopped, or the page is opened on an origin that the API does not allow | Start the API, and open the app on `http://localhost:3000` or `http://127.0.0.1:3000` |
| Browser console: `... is an async Client Component. Only Server Components can be async at the moment.` | `"use client"` was added to an async component | Remove `"use client"`, or fetch in a Server Component and pass the data as props |
| Browser console: `Hydration failed because the server rendered text didn't match the client.` | A Client Component renders something different on the server and in the browser: the current time, a date in the locale of the browser, `localStorage`, `typeof window` | Format dates with a fixed locale and time zone, or compute the value after mount, in `useEffect` |
| `npm` prints `npm warn deprecated eslint@9.39.5: This version is no longer supported.` | `package.json` asks for ESLint 9 (`"eslint": "^9"`), as created by `create-next-app`, and ESLint 9 is no longer maintained | Nothing to do for the course: `npm run lint` works |
| `npm` prints `npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:` and `unrs-resolver` | Recent npm versions block the install scripts of dependencies until you approve them | Nothing to do: lint and build work without that script. Do not approve scripts you have not reviewed |

The tables of the handouts of sessions 1 to 4 still apply, for example for `npm start` without a build, or `params` without `await`.
