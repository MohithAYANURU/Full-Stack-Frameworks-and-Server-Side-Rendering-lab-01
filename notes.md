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
