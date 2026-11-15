# Session 1 lab files

The code of Lab 1, Lab 2 and the project proposal, as plain files. Copy the code from here rather than from the handout or the slides: copying from a rendered page can break quotes, line breaks and indentation.

The folders match the folders of your `movie-night` project. Copy each file to the same path in your project when the lab asks for it.

## Lab 1

| Step | File in this folder | What to do in your project |
|---|---|---|
| 4 | `app/page.tsx` | Replace the content of `app/page.tsx` |
| 5 | `app/about/page.tsx` | Create `app/about/page.tsx` |

Step 5, in `app/layout.tsx`: replace the `metadata` object with this one.

```tsx
export const metadata: Metadata = {
  title: "Movie Night",
  description: "Pick the movie for our next movie night",
};
```

## Lab 2

| Part | File in this folder | What to do in your project |
|---|---|---|
| A | `data/movies.json` | Create `data/movies.json` |
| A | `lib/movies.ts` | Create `lib/movies.ts` |
| A | `components/movie-list.tsx` | Create `components/movie-list.tsx` |
| B | `app/movies/page.tsx` | Create `app/movies/page.tsx` |
| F | `app/movies-client/page.tsx` | Create `app/movies-client/page.tsx` |

Part E, in `app/movies/page.tsx`: add this line just below the imports.

```tsx
export const dynamic = "force-dynamic";
```

Part F: copy `data/movies.json` of your project into its `public/` folder.

Stretch goal S1: replace the Part E line with this one.

```tsx
export const revalidate = 10;
```

## Project proposal

`PROPOSAL.md` is the template of your project proposal. Create your own project in a new folder next to `movie-night`, not inside it. Copy the template to the root of your project, fill it in, then commit and push it before session 2.
