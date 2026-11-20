In which file are the <html> and <body> tags?
-->layout.tsx

Which file renders the page at /?
-->app/page.tsx

Which folder is for images and other static files, and how do you reference them?
-->public folder, and you reference them with a relative path starting from the public folder

What is tsconfig.json  doing in your project?
-->It configures TypeScript settings for the project, including compiler options, paths, and module resolution.

What does @/* mean in tsconfig.json? Write an import that uses it.
-->The @/* in tsconfig.json is an alias for the src directory

What does app/layout.tsx import from next/font/google, and what does Next.js do with it at build time?
-->It imports a Google font

What’s the difference between layout.tsx and page.tsx?
-->layout.tsx is used to define the overall structure and layout of the application, while page.tsx is used to define the content and functionality of a specific page within the application.

Where would you put a navbar that appears on every page?
-->You would put a navbar in layout.tsx, as it defines the overall structure and layout of the application.

What is globals.css for, and where is it imported?
-->globals.css is for defining global styles that apply to the entire application. 

What is AGENTS.md, and does your app need it to run?
-->AGENTS.md is a markdown file that likely contains information about agents or contributors to the project. 

In the page source, are the movie titles present for /movies? For /movies-client? Why?
-->For /movies, the movie titles are present in the page source because it is rendered on the server side, and the HTML is sent to the client with the movie titles included. For /movies-client, the movie titles are not present in the initial page source because it is rendered on the client side.

Without the force-dynamic line of Part E, you run npm run build again tomorrow, then npm start, without changing anything else. What does the "Rendered at" timestamp of /movies show, and why?
-->The "Rendered at" timestamp of /movies would show the time when the page was last built, which would be the time when you ran npm run build. This is because without the force-dynamic line, the page is statically generated at build time and does not change until the next build.                    

Part E made every request to /movies about one second slower. Give one situation where force-dynamic is still the right choice, and explain why.
-->Force-dynamic is still the right choice in a situation where the movie catalogue changes frequently, such as once a week, and you want to ensure that users always see the most up-to-date list of movies without needing to rebuild the entire application. By using force-dynamic, each request to /movies will fetch the latest data from the server, ensuring that users always have access to the current movie options. This is particularly important for applications where content is time-sensitive or frequently updated.

A classmate sees [movies] rendered 6 movies in the browser console and says: "So this code runs in the browser." What do you answer, and how can you prove it?
--> I would explain that while the code may run in the browser, it is actually executed on the server side before being sent to the client. The fact that the movie titles are present in the page source for /movies indicates that the data was fetched and rendered on the server. To prove this, you can inspect the network requests in the browser's developer tools and see that the initial HTML response from the server already contains the movie titles, confirming that they were rendered server-side.

Which version would you choose for a public movie catalogue that changes once a week, and why?
--> I would choose the /movies version for a public movie catalogue that changes once a week. This is because the /movies version is statically generated at build time, which means that it will be faster for users to load since the HTML is pre-rendered and served from the server. Since the movie catalogue only changes once a week, it is acceptable to rebuild the application weekly to update the content, ensuring that users always see the most up-to-date list of movies without sacrificing performance.

## Lab 4, part 1

1. After `npm run build` with the API running, the API receives one call to
   `/api/movies` from `generateStaticParams`, followed by one call to
   `/api/movies/1`, `/api/movies/2`, `/api/movies/3`, `/api/movies/4`,
   `/api/movies/5`, and `/api/movies/6`. That is seven calls. `generateMetadata`
   and the page both request the same movie URL with the same fetch options, so
   Next.js deduplicates the identical fetch and sends only one API call per
   movie.

2. `MOVIES_API_KEY` ended up in the prerendered movie page HTML under
   `.next/server/app/movies`, not in the browser JavaScript under
   `.next/static`. Anyone who can visit the page can read a value rendered into
   its HTML. A secret API key should instead be used only in server-side code,
   ideally in a module marked with `import "server-only"`, and never rendered
   by a Client Component.

3. Props crossing from a Server Component to a Client Component are serialized
   into the React Server Components payload. A function is executable code, not
   serializable data, so Next.js refuses a function prop. A `server-only` import
   is also refused in a Client Component because it could expose server code or
   secrets to the browser. The server should fetch the data and pass only
   serializable values to the Client Component.

## Lab 4, part 2

### Rendering strategies

| Page | Strategy | Prediction and real build output | Why |
|---|---|---|---|
| `/` | SSR | Expected dynamic; actual `ƒ /` | The page streams live vote data and must fetch fresh results on each request. |
| `/movies` | ISR | Expected static regeneration; actual `○ /movies` with `10s` revalidation and `1y` expiry | The catalogue is public and can be refreshed periodically instead of fetched for every request. |
| `/movies/[id]` | SSG | Expected SSG; actual `● /movies/[id]` with one page per generated movie | The six known movie pages can be generated at build time for fast, SEO-friendly HTML. |
| `/movies-client` | CSR | Expected static shell; actual `○ /movies-client` | The shell is static, while the browser fetches the movie list after hydration. |

The other exercise pages remain static or SSG pages because their content is
hardcoded and does not need runtime data.

### Build API calls

After clearing `.next/cache`, the build makes eight calls: two calls to
`/api/movies` (one for `generateStaticParams` and one for the `/movies` page,
because they use different fetch options), followed by one call each to
`/api/movies/1` through `/api/movies/6`. The metadata and page fetches for each
movie are deduplicated because their URL and options are identical.

### Streaming and parallel requests

Without `Suspense`, the first byte waits for the sequential movie and vote
requests, so both the first-byte time and the total time are about 2.5 seconds.
Adding `Suspense` lets Next.js send the page heading and fallback immediately,
which improves the first-byte time, but the total remains about 2.5 seconds
because the two requests are still sequential. Replacing the sequential
requests with `Promise.all` starts them together, reducing the total to about
1.5 seconds. With `Suspense` still present, the first byte remains fast and the
total time also improves.

### API-down behavior

| Page | What is seen when the API is stopped | Why |
|---|---|---|
| `/movies` | The last generated catalogue still works. | ISR serves the last successful prerendered version while the API is unavailable. |
| `/movies/2` | The generated movie detail still works. | SSG created the page during the build, so it does not need the API for this request. |
| `/` | The title and `Counting the votes...` fallback appear, then the live list fails. | The page is SSR and uses `no-store`; `Suspense` can stream the shell before the failing request completes. |
| `/movies-client` | `Loading movies...` appears, followed by the error message. | CSR fetches from the browser after the static shell loads, and that request fails when the API is down. |