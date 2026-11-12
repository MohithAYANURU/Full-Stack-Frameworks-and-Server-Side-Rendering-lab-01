# Project Proposal: LiftLog

**A workout tracker with shareable public profiles, built with Next.js and server-side rendering**

| | |
|---|---|
| **Author** | Mohith |
| **Course** | Full-Stack Frameworks and Server-Side Rendering |
| **Date** | November 2026 |
| **Estimated duration** | 1 week |

---

## 1. Summary

LiftLog is a small web application where users log their gym workouts and share a public profile page (e.g. `/u/mohith`) showing their recent workouts and personal records (PRs).

The project is scoped to fit in one week while still demonstrating how a modern full-stack framework (Next.js App Router) lets each page use the rendering strategy that suits it best: static generation, server-side rendering, and on-demand revalidation.

## 2. Problem and motivation

Most workout apps are client-heavy single-page apps. Their public pages are slow to load, poorly indexed by search engines, and show weak link previews when shared. LiftLog addresses this with server-rendered public profiles that load fast and are SEO-friendly.

## 3. Objectives

1. Build a working full-stack application with authentication, a database, and server-side mutations.
2. Apply SSG and SSR deliberately, and add on-demand revalidation on one page.
3. Measure and compare the performance and SEO impact of SSR, SSG, and client-side rendering on the same page.
4. Document the server/client component boundary and how it affects what is sent to the browser.

## 4. Scope

### Must have (MVP)

- Sign up, log in, and log out (simple credentials login)
- Log a workout: choose an exercise, then add sets, reps, and weight
- Workout history list (behind auth)
- Public profile page showing recent workouts and personal records
- Static landing page
- Small static exercise library (about 10 hardcoded exercises)

### Cut to fit one week

- Progress chart
- Dynamic Open Graph image
- Dark mode
- Profile privacy toggle
- PostgreSQL (replaced by SQLite)
- Docker and CI pipeline

### Out of scope

- Social feed, followers, or comments
- Payments or subscriptions
- Real-time features
- Native mobile app

## 5. Rendering strategy

| Page | Strategy | Justification |
|---|---|---|
| Landing page | **SSG** | Static content, fastest possible load, good SEO |
| Exercise library | **SSG** | Content rarely changes, indexable pages |
| Public profile `/u/[username]` | **SSR** (with `revalidatePath` or ISR variant) | SEO and link previews; data changes when a workout is logged |
| Dashboard and workout history | **SSR behind auth** | Personalized data fetched on the server, no SEO needed |
| Log workout form | **Server Actions** | Mutations handled on the server without a separate API layer |

## 6. Technical stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React Server Components, Server Actions |
| Language | TypeScript |
| Database | SQLite |
| ORM | Prisma |
| Auth | Auth.js (credentials, minimal config) |
| Styling | Tailwind CSS |
| Deployment | Vercel (or run locally for the demo) |
| Performance testing | Lighthouse |

## 7. Data model (draft)

- **User**: id, email, username, passwordHash
- **Workout**: id, userId, date, notes
- **WorkoutSet**: id, workoutId, exerciseName, reps, weight

Exercises are a hardcoded list rather than a database table. Personal records are derived from `WorkoutSet` (max weight per exercise) rather than stored separately.

## 8. Deliverables

1. Source code in a Git repository with a short README
2. Deployed application or a documented local run command
3. Short written report covering rendering choices, measurements, and lessons learned
4. Short demo (live or recorded)

## 9. Evaluation plan

To back the rendering choices with evidence, I will build the public profile page in three ways and compare them with Lighthouse:

| Version | Metrics collected |
|---|---|
| SSR | TTFB, LCP, Performance and SEO scores |
| SSG / ISR | TTFB, LCP, Performance and SEO scores |
| Client-side rendered | TTFB, LCP, Performance and SEO scores |

Additional points to document:

- Where the server/client component boundary sits and why
- Cache revalidation example: revalidating a profile page after a new workout is logged (`revalidatePath`)

Screenshots and scores will be saved as they are collected, not at the end.

## 10. Timeline

| Day | Focus | Output |
|---|---|---|
| 1 | Setup, Prisma schema, authentication | Project skeleton, working login |
| 2 | Log workout form with Server Action, history page | Workout logging end to end |
| 3 | Public profile page, landing page, exercise library | SSR profile, SSG pages |
| 4 | `revalidatePath` on profile, deployment | Live app |
| 5 | Lighthouse comparison: SSR vs SSG vs CSR | Measurements and screenshots |
| 6-7 | Report, demo recording, bug fixes | Final deliverables |

## 11. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Auth setup takes a full day | Delays everything after | Keep Auth.js minimal (credentials only); budget Day 1 for it |
| Report left until the end | Rushed or weak report | Take notes and screenshots during each day |
| Scope creep | Incomplete MVP | Follow the must-have list; no nice-to-haves until the report is written |
| Caching behavior is confusing | Stale data bugs | Start with plain SSR, add revalidation only on the profile page, test it explicitly |
| Deployment issues late | No live demo | Deploy a skeleton early and fall back to a local demo if needed |

## 12. Success criteria

- A user can register, log a workout, and see it in their history
- A public profile loads server-rendered with correct page metadata
- SSG, SSR, and on-demand revalidation are each used and justified
- The report includes measured Lighthouse results comparing SSR, SSG/ISR, and CSR
- The project runs with a single documented command

## 13. Conclusion

LiftLog is a deliberately small project that fits in one week yet still shows the real trade-offs between rendering strategies. The public profile page gives a concrete, measurable case for why server-side rendering matters, and the cut features can be added later if time allows.
