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