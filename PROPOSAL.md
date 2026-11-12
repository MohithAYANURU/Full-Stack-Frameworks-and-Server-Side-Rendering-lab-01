# Project proposal

- **Name:** Feras MICHAEL
- **Project title:** ProjectShelf — Student Project Showcase
- **Pitch:** A web application where students can share their programming projects, explore other students' work, and exchange feedback.
- **Target users:** University computer science students who want to present their projects and learn from their peers.

## Pages

| URL | Content | Dynamic segment? | Rendering strategy and why |
|---|---|---|---|
| `/` | Introduction and links to browse or submit projects | No | Static rendering because the introduction rarely changes. |
| `/projects` | List of projects with titles, short descriptions, and technologies | No | Server-side rendering to include current project data in the initial HTML and make it accessible to search engines. |
| `/projects/[id]` | Project description, author name, technologies, repository link, and feedback; form to add feedback | Yes: `[id]` | Server-side rendering for current project details and feedback, with client-side form interactions. |
| `/projects/new` | Form to submit a project | No | Static page shell with a Client Component for validation, submission, and loading/error states. |
| `/projects/[id]/edit` | Form to edit a project, plus a delete action | Yes: `[id]` | Server-side rendering to load the existing project, with a Client Component for editing and deletion. |

## Data

I will use two related entities, stored in a database through Prisma.

### Project

- `id`: unique identifier
- `title`: project name
- `summary`: short description for the project list
- `description`: detailed explanation
- `authorName`: student's display name
- `technologies`: text listing the technologies used
- `repositoryUrl`: link to the source code
- `createdAt`: creation date
- `updatedAt`: last modification date

### Feedback

- `id`: unique identifier
- `projectId`: reference to the related project
- `authorName`: reviewer's display name
- `content`: feedback text
- `createdAt`: creation date
- `updatedAt`: last modification date

**Relationship:** One Project can have many Feedback entries. Each Feedback entry belongs to exactly one Project. Deleting a project also deletes its feedback.

## Write actions

Users can:

- Create a project using the submission form.
- Update a project's information.
- Delete a project after confirming the action.
- Add, edit, and delete feedback on a project detail page.

Forms will validate required fields and repository URLs, show loading states, and display clear success or error messages. Server-side validation will also check submitted data.

## Technical scope

I will build the application with Next.js App Router, TypeScript, and Tailwind CSS, with Cache Components disabled. I will add Route Handlers for reading and writing projects and feedback, then connect them to a database using Prisma. The final application will be deployed on Vercel.

Planned API routes include `/api/projects`, `/api/projects/[id]`, `/api/projects/[id]/feedback`, and `/api/feedback/[id]`, using the relevant GET, POST, PATCH, and DELETE methods.

The application will have five page routes and a shared navigation layout. Authentication, file uploads, chat, and AI features are outside the project scope. For this course demo, names are entered as text and editing is shared: there are no private accounts or ownership permissions.

## Repository

**GitHub URL:** https://github.com/khawlabrs/lab-1-files
