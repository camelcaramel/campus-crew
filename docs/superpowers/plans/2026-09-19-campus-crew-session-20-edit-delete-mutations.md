# Campus Crew Session 20 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Extend the session 19 create mutation with reusable edit forms and confirmed deletion backed by PostgreSQL.

**Architecture:** Keep RecruitmentForm responsible for RHF/Zod fields and presentation; create/edit containers own mutations, query invalidation and navigation. Share the existing string route ID query key through useRecruitmentQuery. Mount the edit form only after detail data is ready, using RHF defaultValues and a record-ID key, so refetches do not erase unsaved input.

**Tech Stack:** Next.js App Router, React Hook Form, Zod, TanStack Query, NestJS, Prisma, PostgreSQL.

**Spec:** User's session 20 request in this task, including all 12 required items and the student verification sequence.

## Global Constraints

- Preserve sessions 4–19 and base commit `070d265` in their existing branches/worktrees.
- Work only in `feat/session-20-edit-delete-mutations`; no destructive Git commands, force push, auth, applications, optimistic updates, new toast/modal libraries or schema changes.
- PATCH returns Recruitment JSON; existing Nest DELETE returns 204 without a body.
- Existing detail query keys use string IDs. Keep that type consistent even though mutation API functions accept numeric IDs.
- Buttons and confirm are UX only; backend authorization belongs to session 23.

## Review Focus

- Cached data and background refetch must not wipe edits; fresh edit navigation must reflect stored data.
- Delete cancellation sends no request; pending state prevents duplicate submissions.
- A deleted or invalid ID renders query error UI without an empty edit form.
- A failed mutation retains input and permits retry without navigating.
- Create retains session 19 validation, author payload and cache behavior.

## Task 1: HTTP boundaries

**Files:** `apps/web/src/features/recruitments/api.ts`, `types.ts`, `apps/web/test/edit-delete-recruitment.test.mjs`.

**Interfaces:** `updateRecruitment(id: number, input: UpdateRecruitmentRequest): Promise<Recruitment>`; `deleteRecruitment(id: number): Promise<void>`. UpdateRecruitmentRequest is a Partial of title/category/content, excluding author identity.

- [x] Add real HTTP contract tests for partial PATCH JSON, returned record, empty DELETE 204, HTTP errors, malformed PATCH JSON and network failures.
- [x] Run `npm test --workspace=@campus-crew/web`; confirm new API functions are missing while old tests pass.
- [x] Implement PATCH and DELETE with response.ok checks and Korean error messages; never parse DELETE JSON.
- [x] Run the complete web test suite; expect all tests passing.

## Task 2: Form and pages

**Files:** `recruitment-form.tsx`, new `create-recruitment-form.tsx`, new `queries.ts`, `apps/web/src/app/recruitments/new/page.tsx`, `[id]/page.tsx`, new `[id]/edit/page.tsx`.

**Interfaces:** RecruitmentForm receives mode, defaultValues, onSubmit, isPending, errorMessage and cancelHref. Existing Zod schema is unchanged. useRecruitmentQuery(id: string) shares detail query configuration.

- [x] Extract create mutation to its container and preserve all existing fields/validation/error/pending behavior.
- [x] Edit query shows loading/error first, then mounts a keyed form with title/content/category defaults.
- [x] Update mutation awaits exact list and detail invalidation, then navigates to detail. Use `['recruitments', id]` with string id.
- [x] Detail renders edit link and delete button. Confirm cancellation returns immediately; pending disables controls; errors use role=alert.
- [x] Delete awaits exact list invalidation, marks the detail stale without refetching it, and replaces the route with the list. A revisit fetches 404 instead of trusting fresh deleted data.
- [x] Run web lint/build; expect no errors. Browser-test defaults, edit success, list/detail freshness, cancel, pending, error recovery, delete and deleted-ID error.

## Task 3: Verification and teaching record

**Files:** `docs/session-20-edit-delete-mutations.md`, `README.md`, this plan.

- [x] Run existing PostgreSQL with this worktree's Nest and Next servers. Create a dedicated browser test record; preserve all pre-existing rows.
- [x] Capture actual browser-driven PATCH 200 and DELETE 204, verify SQL values and deletion, and restart API to check persistence.
- [x] Run root format:check, lint, build, all web tests and API/DB e2e.
- [x] Obtain an independent code review and resolve material findings.
- [x] Document exact verification results and limitations, defaultValues lifecycle, cache/DB difference, 204, confirm/auth boundary and session 21 signup/password hashing transition.
- [x] Commit as `feat: connect recruitment edit and delete mutations`, preserving all earlier commits.

## Execution Record

- User explicitly requested plan then immediate implementation; execute inline without another design/plan approval round.
- Existing session 19 worktree is preserved by creating a separate session 20 worktree under this task's outputs.
- Existing DB container is healthy. No migration, seed reset or existing-row deletion is required.
- Task 1 complete: existing 10 tests passed, new 7 failed before implementation; all 17 passed after API implementation.
- Review fixes: force an initial detail revalidation before mounting edit defaults; keep the form rendered across transient background refetch errors, but show error UI for 404. Three page state regression tests added; web suite 20/20.
- Ruling: use an inline confirmation group with cancel/confirm buttons. Native window.confirm stalled the available browser automation; the inline option satisfies the requested minimum confirm UX without a modal component or dependency.
- Task 2 complete: real browser create/PATCH defaults, pending, duplicate prevention, success/list refresh, API failure/retry, delete cancel/error/pending/success and deleted-ID errors verified.
- Task 3 verification: root format/lint/build passed; API/DB e2e 11/11; browser PATCH 200 and DELETE 204; psql confirms test row 38 deleted and existing 8 rows preserved. API restart confirms persistence. Network panel/DBeaver replaced by browser-correlated HTTP server logs and psql evidence.
