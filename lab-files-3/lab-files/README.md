# Session 3 lab files

The starter files of Lab 4, in sessions 5 and 6: the Movie API and its data. The lab handout, `session-03-lab-handout.md`, guides you through the code that uses it.

Copy the files rather than retyping them: copying from a rendered page can break quotes, line breaks and indentation. Start from your `movie-night` project as it was at the end of Lab 3.

## Files

| File in this folder | What to do in your project |
|---|---|
| `api/server.mjs` | Create the folder `api` and copy the file into it |
| `api/data/movies.json` | Create the folder `api/data` and copy the file into it |
| `api/data/votes.json` | Copy it next to `api/data/movies.json` |

Do not change these files during the lab. The API has no dependencies: it only needs Node.js.

## Start the API

Add this script to `package.json`. Put a comma at the end of the line before it.

```json
    "api": "node api/server.mjs"
```

Then run it in its own terminal and keep it running:

```bash
npm run api
```

The terminal prints `Movie API on http://127.0.0.1:4001/api/movies`, then one line for each call, with the time, the call number, the path and the user agent of the caller.

## What the API returns

| Request | Delay | Response |
|---|---|---|
| `GET /api/movies` | 1 s | `200`, an array of movies |
| `GET /api/movies/:id` | 1 s | `200`, one movie, or `404` with `{ "error": "Movie not found" }` |
| `GET /api/votes` | 1.5 s | `200`, an object `{ votes, countedAt }` |
| Any other method | none | `405` with `{ "error": "Method not allowed" }` |
| Any other path | none | `404` with `{ "error": "Not found" }` |

A movie:

```json
{ "id": 2, "title": "Inception", "year": 2010, "genre": "Sci-Fi", "minutes": 148 }
```

The votes: `votes` is an array of `{ "movieId": number, "count": number }`, one item per movie, and `countedAt` is the time of the count as an ISO date string.

```json
{ "votes": [{ "movieId": 2, "count": 14 }], "countedAt": "2026-11-18T14:05:12.345Z" }
```

The id in the URL is the movie `id`: `/api/movies/2` returns Inception.

The API allows browser requests from pages on `http://localhost:<port>` and `http://127.0.0.1:<port>` (CORS). Requests from the Next.js server do not need this.
