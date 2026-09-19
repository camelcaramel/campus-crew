# Campus Crew Session 18 Frontend Query Integration Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace mock-backed recruitment list/detail reads with TanStack Query and the session 17 PostgreSQL API while preserving lessons 4–17.

**Architecture:** RootLayout wraps the existing layout in a client Providers component with a stable QueryClient. Small typed GET functions call same-origin `/api/recruitments` and `/api/recruitments/:id`; Next rewrites forward to Nest on port 4000. Client pages use useQuery directly and keep existing cards, labels, Spinner, ErrorMessage and EmptyState.

**Tech Stack:** Existing npm workspaces, Next.js 16, React 19, NestJS 11, Prisma 7, PostgreSQL; add TanStack React Query v5.

**Spec:** User's session 18 request in this task; verified session 17 base commit `68cb893`.

## Global constraints

- Worktree: `outputs/campus-crew-session-18`; branch `feat/session-18-frontend-query-integration` from `68cb893`.
- No destructive Git commands, no prior commit amendments, no merge/push.
- Browser uses relative `/api/*`; server-side rewrite targets `http://localhost:4000/api/*`. Next serves on 3000.
- Read only: no form mutations, auth, applications, filters, pagination, SSR hydration or query factories.
- API types follow Prisma response: numeric id/authorId, category STUDY/PROJECT/CONTEST, status OPEN/CLOSED, author id/name, ISO createdAt/updatedAt.
- Keep the existing mock lesson fixture outside live reads, and keep form behavior unchanged.
- Use fetch, res.ok, JSON parsing, thrown Error and explicit types; no any.

## Review focus

1. HTTP errors including non-JSON proxy failures must render ErrorMessage, never masquerade as empty data.
2. Missing or invalid detail ids must show an error and retain a list navigation link.
3. An empty list and a slow request must exercise EmptyState and Spinner through actual query state.
4. Navigation between details must use each route id, without sharing the wrong cache entry.
5. Refetch after a reversible database edit must update rendered content, while preserving original seed rows.

## Task 1: Safe baseline and typed network boundary

**Files:** `apps/web/src/lib/api-client.ts`, `apps/web/src/features/recruitments/api.ts`, `apps/web/src/features/recruitments/types.ts`, `apps/web/src/features/recruitments/mock-data.ts`, `apps/web/test/api-client.test.mjs`, package manifests/lockfile.

**Interfaces:** `getJson<T>(path: string): Promise<T>`, `getRecruitments(): Promise<Recruitment[]>`, `getRecruitment(id: string): Promise<Recruitment>`.

- [x] Check source worktree status, create session 18 worktree, install existing dependencies and run baseline web lint/build.
- [x] Add focused HTTP boundary tests before implementation: successful JSON, HTTP 404, non-JSON 500 and network failure. Use Node test runner, TypeScript transpilation and a real local HTTP server; no new test framework.
- [x] Implement typed fetch helper and recruitment API functions; run boundary tests.
- [x] Preserve old fixture with a fixture-only type; add category labels for existing Korean UI.

Implementation contract:

```ts
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? '모집글을 찾을 수 없습니다.'
        : '모집글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    );
  }
  return response.json() as Promise<T>;
}
```

## Task 2: Query provider, proxy and live read screens

**Files:** `apps/web/src/lib/query-client.ts`, `apps/web/src/providers.tsx`, `apps/web/src/app/layout.tsx`, `apps/web/next.config.ts`, recruitment list/detail pages and card.

**Interfaces:** `createQueryClient(): QueryClient`; `Providers({children})`; query functions from Task 1.

- [x] Install `@tanstack/react-query@5` in the web workspace and pin the resolved version.
- [x] Use `useState(createQueryClient)` in Providers; configure a 30-second staleTime and no automatic retries so classroom failure demonstrations are immediate. Keep a manual refetch action.
- [x] Add rewrite `/api/:path*` → `http://localhost:4000/api/:path*`.
- [x] List uses `useQuery({ queryKey: ['recruitments'], queryFn: getRecruitments })`; replace mode switch with isPending/isError/data.length branches.
- [x] Detail uses `useParams<{id: string}>()` and `useQuery({queryKey: ['recruitments', id], queryFn: () => getRecruitment(id)})`; retain detail layout and back link.
- [x] Keep Korean category labels and readable ISO date display; reuse existing card and status components.
- [x] Run web lint/build and HTTP boundary tests.

## Task 3: Integrated validation and classroom handoff

**Files:** `docs/session-18-frontend-query-integration.md`, `README.md`, this plan.

- [x] Inspect/start Docker PostgreSQL if accessible; reuse existing local DB without destructive seeding.
- [x] Start this worktree's Nest on 4000 and Next on 3000, confirm both same-origin GET endpoints against real DB values.
- [x] Browser: seed list, card → detail, direct detail, 404, normal-console/network observations.
- [x] Failure/empty/loading: exercise controlled endpoint conditions without deleting user data; document whether real or simulated.
- [x] If possible, use a transaction or reversible DB edit followed by refetch, restoring the exact original row afterward.
- [x] Run root format:check, lint, build, web boundary tests and existing API e2e suite.
- [x] Review full diff with a fresh reviewer, confirm API/schema/seed/form and original worktree preserved, record limits honestly.
- [x] Commit `feat: connect recruitment queries to api` and retain worktree.

Documentation covers server state versus local state, QueryClient/Provider, useQuery, queryKey/queryFn, pending/error/data, cache lifetime, list versus detail keys, separated fetch functions and the session 19 useMutation POST handoff.

## Execution record

- Plan created before product edits. User explicitly requested writing the plan and proceeding with implementation; no additional design approval gate is needed.
- Source session 17 worktree is clean. A new worktree was created at the requested output location from `68cb893`; prior lesson worktrees remain untouched.

- Task 1 complete: npm baseline dependencies installed; initial sandbox network/cache restriction was resolved with approved network execution and workspace cache. Baseline web lint/build passed. Five boundary tests failed because the client was absent, then passed after implementation. Actual session 17 response fields verified.
- Task 2 complete: TanStack React Query 5.103.1 installed and pinned; stable root provider, same-origin rewrite, typed API functions, live list/detail and real query states implemented. No mutation or auth changes. Build and web lint passed.
- Task 3 complete: healthy existing Docker PostgreSQL reused; this worktree's Nest start/dev and Next dev launched successfully. Browser seed list, id 1 and 5 detail, direct reload, 404, API-stop error and retry recovery passed. Controlled 6-second empty response verified Spinner then EmptyState. Temporary fixture server removed.
- Reversible SQL demo: title change appeared in both list and detail on fresh queries; 60-second safeguard restored original data. Exact full recruitment row snapshots (including timestamps) matched afterward. No seed deletion or reseeding.
- Network observation: browser DevTools Network panel is not exposed by the tool. Same-origin HTTP 200 responses and browser-action-correlated request logs confirmed GET /api/recruitments and /api/recruitments/1, with x-forwarded-host localhost:3000. This limitation is documented rather than claiming a manual Network-panel inspection.
- Validation: root format:check, lint, build; web HTTP tests 5/5; API real-DB e2e 11/11; git diff --check passed. Independent reviewer found no actionable correctness or regression issues. Normal browser console had no warnings/errors.
- Preservation: original session 17 worktree remains clean; API/schema/migrations/seed/compose and form/schema/new-page compare identical to 68cb893. Existing lesson history retained.
- Decision: execute inline from the user's supplied scope and write the requested plan before product changes. Use manual browser state verification for the small UI changes; focused automated HTTP boundary tests cover failures. Keep legacy fixture with its own type instead of deleting prior teaching data.
- Final disposition: stop only verification servers; retain existing PostgreSQL container and session 18 branch/worktree. Commit with requested message; no merge, push or prior commit amendment.
