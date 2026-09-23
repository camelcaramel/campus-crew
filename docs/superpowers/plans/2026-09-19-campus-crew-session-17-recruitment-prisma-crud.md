# Campus Crew Session 17 Recruitment Prisma CRUD Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track completion with the checkboxes below.

**Goal:** Replace the recruitment memory array with PostgreSQL CRUD through Prisma, retaining lessons 4–16 and leaving the frontend unchanged.

**Architecture:** A Nest injectable `PrismaService extends PrismaClient` owns the PrismaPg adapter and connects in `onModuleInit`. `PrismaModule` exports this singleton to `RecruitmentsModule`. Controller → service → Prisma → PostgreSQL remains the entire request flow.

**Tech Stack:** Existing NestJS 11, Prisma 7.10.0, PostgreSQL 17, TypeScript, npm workspaces, Node test runner.

**Spec:** The user's session 17 request in this task: five recruitment endpoints, authorId in POST, optional PATCH fields, author id/name in responses, 404 for missing rows, 204 DELETE, real seeded DB and persistence checks.

## Global Constraints

- Base commit `dafb512` (session 16); separate `feat/session-17-recruitment-prisma-crud` worktree under this task's outputs.
- No reset, clean, force push, amendment, frontend changes, auth, applications feature, search/filter/pagination, repositories, custom exception filters, or new production dependencies.
- Preserve schema, migration, seed, prior lesson documents and prior worktrees.
- Keep `/docs`; expose request bodies using only small Swagger property decorators.
- POST accepts title/content/category/authorId. Server supplies id/status/timestamps.
- PATCH accepts only title/content/category/status; never forward the raw body to Prisma.
- Read and mutation responses include only `author: { id, name }` from the user relation.
- Test only newly created recruitment rows for mutation/deletion; never delete or modify seed rows. Record seed snapshots before/after.

## Review Focus

1. API must return actual seeded DB rows, not the old three-item memory array.
2. Missing recruitment GET/PATCH/DELETE must return 404; malformed route ids must not reach Prisma as NaN.
3. Unknown authorId must become a simple 400 and must not insert a row; database FK remains authoritative.
4. PATCH must preserve omitted fields and reject ownership/id/nested relation changes by selecting allowed fields explicitly.
5. Created and edited rows must survive a full API process restart; DELETE must return no body and subsequent GET 404.

## Task 1: Capture the baseline and write behavioral tests

**Files:** `apps/api/test/recruitments.e2e.mjs`; new session plan (this file).

- [x] Install exactly the lockfile dependencies, run the existing build and existing six HTTP tests before changing product code.
- [x] Confirm the existing local DB is reachable. Read users/recruitments/applications and capture their values without printing credentials or password hashes.
- [x] Replace the memory-specific expectations in the HTTP test with direct `pg` reads of the actual DB. Start the built server on a free port and always clean up only test-created rows and the child server.
- [x] Write failing tests for seeded list/detail and author selection, create/read, optional updates, missing row errors, missing author, 204 delete, Swagger schemas, and restart persistence. Assert seed values are unchanged after testing.

```js
assert.equal(created.status, 'OPEN');
assert.deepEqual(Object.keys(created.author).sort(), ['id', 'name']);
assert.equal(
  (await request('DELETE', `/api/recruitments/${created.id}`)).status,
  204,
);
assert.equal(
  (await request('GET', `/api/recruitments/${created.id}`)).status,
  404,
);
```

Run `node --test apps/api/test/recruitments.e2e.mjs` against the old build. Expected: the new behavior tests fail because the API still uses an array and has no PATCH/DELETE.

## Task 2: Connect the complete CRUD flow

**Create:** `apps/api/src/prisma/prisma.service.ts`, `prisma.module.ts`, `apps/api/src/modules/recruitments/update-recruitment.dto.ts`.

**Modify:** recruitment service/controller/module/create DTO; `apps/api/src/main.ts`, `apps/api/tsconfig.json`, `apps/api/package.json`, `apps/api/src/prisma/README.md`.

- [x] Add `PrismaService`, using the existing generated client path and adapter. Fail clearly when DATABASE_URL is absent; use only OnModuleInit for lifecycle.

```ts
super({ adapter: new PrismaPg({ connectionString }) });
async onModuleInit() { await this.$connect(); }
```

- [x] Export the provider from PrismaModule and import that module into RecruitmentsModule.
- [x] Implement list/detail/create/update/remove with the five Prisma APIs and simple exceptions. Use `include: { author: { select: { id: true, name: true } } }`. Order list by id for predictable classroom comparisons.
- [x] Use explicit create/update data fields. Missing author uses a simple existence check/400; locally translate FK or disappeared-row races where needed, without a custom filter.
- [x] Add PATCH and DELETE controller handlers, ParseIntPipe for route ids, and `@HttpCode(204)` for DELETE.
- [x] Retain existing generator output outside src. Widen TypeScript rootDir to `.` so generated TypeScript is compiled alongside src; update production start to `dist/src/main.js`. Keep dev startup working.
- [x] Load repository-root `.env` before Nest construction (same DATABASE_URL as CLI/seed), preserving process variables and existing API-specific PORT configuration. Resolve paths correctly from both src and dist/src.
- [x] Add `predev`/`prebuild` client generation and `test:e2e` for reproducibility.

Run `npm run build --workspace=@campus-crew/api`, then `npm run test:e2e --workspace=@campus-crew/api`. Expected: all HTTP/DB tests pass, including restart and untouched seeds.

## Task 3: Classroom handoff and full verification

**Create:** `docs/session-17-prisma-crud.md`, `docs/postman/campus-crew-session-17.postman_collection.json`.
**Modify:** top-level README only to link the new lesson.

- [x] Provide a Postman collection that derives a real authorId and seeded detail id from GET list, creates its own practice row, checks list membership, patches, verifies, deletes and checks 404. Include an optional manual restart persistence sequence.
- [x] Document setup, five endpoints, Prisma method mapping, request examples, 204 semantics, DB constraints vs application checks, auth follow-up, input-validation limits and the next lesson's FE list/detail connection.
- [x] Launch the API dev command; verify real CRUD and Swagger `/docs` plus OpenAPI paths. Record Docker status or the precise environment limitation if the Docker named pipe remains inaccessible; actual TCP DB tests are required independently.
- [x] Run Prisma generate/typecheck, `format:check`, API/web lint/build, full HTTP DB tests, and inspect diff to confirm no frontend/schema/migration/seed changes.
- [x] Obtain one independent final code review, resolve material findings and verify fixes.
- [x] Commit all session 17 changes as `feat: connect recruitment crud to prisma`; retain all previous commits and worktrees. Record actual outcomes in the lesson doc and final reply, with no unverified success claims.

## Execution record

- Initial inspection: session 16 worktree clean at dafb512; prior lesson worktrees present.
- Separate session 17 branch/worktree created from dafb512; original worktree untouched.
- Environment: use installed `C:/Program Files/nodejs/npm.cmd` because the default npm shim points at a missing installation.
- Docker CLI initially denied access to its named pipe. Permission request tool cannot represent this pipe path; use actual PostgreSQL connectivity for DB verification and report Docker inspection separately.

- Task 1 complete: baseline build and six original HTTP tests passed; new real-DB tests produced eight expected failures against the array implementation. Existing DB remained unchanged.
- Task 2 complete: Prisma singleton/module, five endpoints, selected author fields, explicit writable fields, 404/400/204 semantics and generated-client build paths implemented. Real DB tests passed, including full process restart.
- Test harness correction: raw PostgreSQL timestamp text confirmed Prisma UTC values; configured pg comparison parser for timestamp-without-timezone as UTC to avoid this Windows machine's timezone offset. No product timestamp behavior changed.
- Task 3 complete: classroom documentation and executable Postman collection prepared; development server request replay passed nine requests/fourteen assertions. Prisma typecheck and root format/lint/build checks passed.
- Final review: one material route-id bounds finding reproduced as HTTP 500, then fixed with a small shared bounds check returning 400; final full HTTP/DB suite 11/11 passed after final build. No deferred review findings.
- Preservation check: original session 16 worktree clean; frontend/schema/migrations/seed/config/lockfile/compose unchanged. DB rows remain 3/6/3 with seed snapshots unchanged; only auto-increment sequence advances during tests.
- Environment limitations: Docker named pipe prevents container status inspection. Nest watch child termination is restricted on file changes; fresh dev launch and actual CRUD replay succeeded. Verification servers stopped. Exact-version Prisma engine reused from session 16 after restricted download; no repository dependency changes.
- Final disposition: commit as requested and retain the separate branch/worktree for lesson 18; no merge or push requested.
