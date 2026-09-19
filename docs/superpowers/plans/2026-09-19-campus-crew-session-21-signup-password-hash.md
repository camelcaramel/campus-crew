# Campus Crew Session 21 Signup Password Hash Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. The user explicitly requested planning followed by execution in this session.

**Goal:** POST /api/auth/signup creates a User with a bcrypt hash and returns only id, email, name, createdAt.

**Architecture:** AppModule imports AuthModule; AuthController receives SignupDto and delegates to AuthService, which uses the existing PrismaModule/PrismaService. Global ValidationPipe whitelists DTO fields. Existing recruitment DTO fields receive Allow decorators to preserve sessions 4–20. Prisma email uniqueness and P2002 mapping handle concurrent duplicate signup.

**Tech Stack:** Existing NestJS 11, Prisma 7, PostgreSQL 17, npm workspaces; bcryptjs, class-validator, class-transformer.

**Spec:** User request in this task (2026-09-19): session 21 backend signup + password hash only.

## Global Constraints

- Preserve sessions 4–20, all original commits, source worktrees and existing database rows.
- New branch feat/session-21-signup-password-hash in outputs/campus-crew-session-21. Incorporate the completed session-20 commit before final verification.
- No login, JWT, cookies, guards, me, logout, authorization, refresh tokens or OAuth.
- name 2–20 characters, valid email, password 8–50 characters; bcrypt cost 10.
- Never return password or passwordHash, including error responses.
- bcrypt only uses 72 UTF-8 bytes: reject longer byte sequences explicitly instead of silently truncating Unicode passwords; document this additional byte constraint.
- No destructive Git commands; commit message feat: add signup with password hash.

## Review Focus

- Concurrent same-email requests: exactly one 201, other 409, one row.
- Extra input fields cannot set id/passwordHash/relations.
- Missing/null/nonstring/overlong input returns 400 without insertion or password disclosure.
- Existing recruitment POST/PATCH remains operational with global whitelist.
- Multibyte password limits and salt randomness are verified using real stored hashes.

## Task 1: Signup API and regression coverage

**Files:** Create apps/api/src/modules/auth/{auth.module.ts,auth.controller.ts,auth.service.ts,signup.dto.ts,signup-response.dto.ts}; create apps/api/test/signup.e2e.mjs; modify apps/api/src/{main.ts,app.module.ts}, recruitment create/update DTOs, apps/api/package.json and package-lock.json.

**Interfaces:** Consumes PrismaService.user.create. Produces POST /api/auth/signup accepting {name,email,password}; 201 {id,email,name,createdAt}, 409 {statusCode:409,code:'USER_EMAIL_ALREADY_EXISTS',message:'이미 사용 중인 이메일입니다.'}, standard Nest 400 validation errors.

- [x] Install pinned bcryptjs/class-validator/class-transformer in API workspace; copy ignored local .env without displaying credentials.
- [x] Write HTTP integration tests using node:test, a child API process on an available port, and SQL via pg. Assert 201, exact response keys, stored hash format/cost, correct and incorrect compare, randomized salts, duplicate/racing 409, validation 400, no extra fields, and Swagger DTO contracts. Clean up only rows created by this run.
- [x] Build unchanged API and run new tests: expect 404 versus expected 201/400 (RED).
- [x] Add DTO decorators IsString/Length(2,20), IsEmail, IsString/Length(8,50) plus safe UTF-8 ValidateBy, plus ApiProperty. Use definite assignment assertions under existing strict TypeScript settings.
- [x] Implement service core:

```ts
const passwordHash = await hash(body.password, 10);
return await this.prisma.user.create({
  data: { name: body.name, email: body.email, passwordHash },
  select: { id: true, email: true, name: true, createdAt: true },
});
```

Catch Prisma.PrismaClientKnownRequestError with code P2002 and throw ConflictException with the required payload; rethrow other errors. Do not precheck without handling the create race.

- [x] Register AuthModule importing PrismaModule and exposing one controller/service. Controller path api/auth, method signup, @Post('signup'), Swagger 201 response DTO and 400/409 documentation.
- [x] Add global new ValidationPipe({whitelist:true}); add @Allow() only to existing recruitment DTO fields so their previous behavior is preserved.
- [x] Build and run signup tests and existing recruitment tests sequentially on the actual Docker PostgreSQL (GREEN). Run existing web tests.

## Task 2: Teaching notes and live verification

**Files:** Create docs/session-21-signup.md and docs/postman/session-21-signup.postman_collection.json.

**Interfaces:** Uses Task 1 endpoint and Swagger /docs. Documents next session compare and login/JWT without implementing them.

- [x] Explain signup as User row creation, hash versus reversible encryption, salt/cost, DTO runtime validation, 409 uniqueness, Prisma select, and future compare.
- [x] Create repeatable Postman requests with assertions for 201, 409, bad email 400 and short password 400; document SQL inspection and a unique test email.
- [x] Start a separate API on port 4021, use Swagger UI to execute a signup and duplicate, inspect SQL row and hash characteristics without logging full hashes. Use SQL instead of DBeaver UI if native app control is unavailable.
- [x] Integrate the completed session-20 commit with a non-destructive merge; inspect ancestry and unchanged web source.
- [x] Run npm run check (format:check, all lint, all build), API e2e and web regression tests. Record actual evidence and limitations in the notes.
- [x] Obtain independent final code review while completing documentation/verification. Address material findings with regression coverage.
- [x] Commit all session-21 changes as feat: add signup with password hash; verify clean status and ancestry. Keep the branch/worktree available for the user.

## Execution notes

- Base advanced non-destructively from 070d265 to completed session-20 fe1e963 with fast-forward; session-20 source worktree was untouched.
- RED: signup test 6/6 failed with missing route. GREEN: signup + existing CRUD passed.
- Independent review identified malformed Unicode causing 500 and malformed JSON leaking request fragments. Both regression tests failed before the fix, then the complete API suite passed 19/19.
- Ruling: replace IsByteLength with safe ValidateBy because its encodeURI throws for isolated surrogates; reject malformed Unicode and >72 UTF-8 bytes. Tradeoff: byte limit is additional to the 8–50 character limit.
- Ruling: register body parsers explicitly and sanitize only entity.parse.failed errors before Nest sees them; necessary to prevent password fragments in errors. Normal validation error formatting stays unchanged.
- Swagger UI: 201, duplicate 409, bad email 400, short password 400. SQL confirms hash prefix/cost and no plaintext; DBeaver/Postman UI were not used.
- Session-20 web tests 20/20 pass after integration. No deferred review findings.

- Final verification: npm run check PASS on the integrated session-20+21 branch; web 20/20, API 19/19. Commit and clean-status verification are executed as the final step of this session.
