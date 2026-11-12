# Project proposal

* Name: Mohith
* Project title: LiftLog
* Pitch (one sentence): A workout tracker where lifters log their sets and share a fast, SEO-friendly public profile page with their recent workouts and personal records.
* Target users: Gym-goers who want a simple way to track their training and share their progress with friends or a coach via a link.

## Pages

| URL | Content | Dynamic segment? | Rendering strategy and why |
|---|---|---|---|
| / | Landing page explaining the app, with sign-up and login links | No | SSG: static content, fastest load, good SEO |
| /exercises | Exercise library list (about 10 hardcoded exercises) | No | SSG: content never changes at runtime, indexable |
| /exercises/[slug] | Detail page for one exercise (muscle group, description) | Yes, `slug` | SSG with `generateStaticParams`: the list of exercises is known at build time |
| /register | Sign-up form | No | SSG shell with a Server Action: the page itself is static, only the submission needs the server |
| /login | Login form | No | SSG shell with a Server Action: same reasoning as /register |
| /dashboard | The logged-in user's recent workouts and personal records | No | SSR behind auth: personalized, must be fresh on every request, no SEO needed |
| /workouts/new | Form to log a workout (exercise, sets, reps, weight) | No | SSR behind auth, with a Server Action: auth check on the server, mutation without a separate API |
| /workouts/[id] | Detail view of one of the user's workouts | Yes, `id` | SSR behind auth: data is private and per-user, ownership is checked on the server |
| /u/[username] | Public profile with recent workouts and personal records | Yes, `username` | ISR with on-demand revalidation (`revalidatePath` after a workout is logged): needs SEO and link previews, and data only changes when the owner logs a workout. I will also build SSR and client-side rendered versions of this page to compare them in the report |

## Data

Entities (2 to 4), their main fields, and how they are related:

* **User**: id, email, username (unique), passwordHash
* **Workout**: id, userId, date, notes
* **WorkoutSet**: id, workoutId, exerciseSlug, reps, weight

Relationships:

* A User has many Workouts (one-to-many, `Workout.userId`)
* A Workout has many WorkoutSets (one-to-many, `WorkoutSet.workoutId`)

Exercises are a hardcoded list (referenced by `exerciseSlug`) rather than a table. Personal records are derived from WorkoutSet (max weight per exercise), not stored separately.

## Write actions

What users can create, update or delete:

* Create an account (register) and log in or out
* Create a workout with its sets (Server Action)
* Update a workout's notes, or edit and remove its sets
* Delete a workout (its sets are deleted with it)
* After any create, update or delete, the user's public profile is revalidated with `revalidatePath`

## Repository

GitHub URL: https://github.com/MohithAYANURU/Full-Stack-Frameworks-and-Server-Side-Rendering-lab-01/tree/project
