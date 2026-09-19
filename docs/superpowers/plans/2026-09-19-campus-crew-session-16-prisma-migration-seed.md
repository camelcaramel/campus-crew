# Campus Crew 16차시 Prisma Migration / Seed Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track actual results below.

**Goal:** 14차시 ERD를 Prisma 7 schema로 옮기고 15차시 PostgreSQL에 migration과 반복 가능한 seed를 적용한다.

**Architecture:** NestJS의 기존 in-memory API는 유지한다. Prisma CLI는 `apps/api/prisma.config.ts`에서 저장소 루트 `.env`를 읽고, 별도 seed가 PostgreSQL adapter와 생성된 Client를 사용한다. DB 작업만 이번 차시 범위다.

**Tech Stack:** npm workspaces, Prisma / Client / adapter-pg 7.10.0, PostgreSQL 17, TypeScript, ts-node.

**Spec:** 사용자의 이번 요청에 명시된 세 모델/세 enum과 `docs/erd.md`, `docs/session-15-local-database.md`.

## Global Constraints

- 기존 4~15차시 파일과 커밋 보존. 기준 커밋 `a16fe78`에서 `feat/session-16-prisma` 별도 worktree 사용.
- Prisma 7.10.0: npm registry에서 확인한 최신 안정 7.x. 정확한 버전과 lockfile 기록.
- `schema.prisma -> prisma migrate dev -> prisma db seed` 유지. Prisma 8 계약 workflow 금지.
- 직접 작성한 TypeScript에 `any` 금지. Nest PrismaModule/PrismaService, CRUD 연동, auth/JWT/bcrypt/TanStack Query 제외.
- 실제 `.env`와 생성된 Client는 Git 제외. 학생 설정은 기존 루트 `.env` 하나를 DB 연결의 기준으로 사용.
- 파괴적 Git 명령 및 DB reset/volume 삭제 금지. 커밋은 `feat: add prisma schema and seed`로 별도 작성.

## Review Focus

- 반복 seed로 행 수가 증가하지 않아야 한다: 두 번 실행 후 동일 id/행 수 확인.
- 기존 데이터가 있어도 삭제하거나 고정 ID를 덮어쓰지 않는다: email upsert, 작성자+제목 조회, 복합 unique upsert.
- 모노레포 실행 위치: `cd apps/api`에서 모든 Prisma 명령 실행, 루트 `.env`를 파일 위치 기준 로딩.
- Prisma 7은 migration 후 Client와 seed를 자동 실행하지 않는다: 명시적 generate 및 db seed 안내.
- 기본 API는 in-memory 유지: `apps/api/src`와 `apps/web`의 기준 커밋 대비 변경 없음 확인.

## Task 1: Prisma 설정과 migration

Files: `apps/api/package.json`, `package-lock.json`, `apps/api/prisma/schema.prisma`, `apps/api/prisma.config.ts`, `.gitignore`, `.prettierignore`, `apps/api/eslint.config.mjs`, `.env.example`.

- [x] 기존 worktree 상태/커밋, Docker 접속 및 5432 상태 확인. Docker 권한 거부는 실제 실패로 기록한다.
- [x] Prisma 7.10.0 관련 패키지와 pg/dotenv, 개발 도구 ts-node/@types/pg를 exact 설치한다.
- [x] schema는 사용자 제공 모델/enum을 그대로 사용. generator는 `prisma-client`, output `../generated/prisma`, moduleFormat `cjs`; datasource provider `postgresql`.
- [x] config는 `dotenv.config({path: resolve(__dirname, '../../.env')})`, `defineConfig`로 schema/migrations/seed/datasource를 지정한다.
- [x] `npx prisma validate`, `npx prisma format` 성공 후 `npx prisma migrate dev --name init`을 실행한다. drift/reset 요청이 나오면 중단하고 원인을 확인한다.
- [x] 생성된 SQL에서 세 enum, 세 table, PK/FK/email unique/복합 unique/cascade를 확인한다.

## Task 2: Seed와 실제 데이터 검증

Files: `apps/api/prisma/seed.ts`, `apps/api/tsconfig.prisma.json`, `docs/session-16-prisma.md`, `docs/session-16-verify.sql`.

- [x] seed 전에 SQL로 테이블/행 상태를 확인한다. 실제 연결이 없으면 성공으로 처리하지 않는다.
- [x] Prisma Client를 명시적으로 생성한다: `npx prisma generate`.
- [x] teacher/student1/student2를 email로 upsert한다. passwordHash는 `PLACEHOLDER_NOT_A_REAL_PASSWORD_HASH`.
- [x] 모집글 6개(각 category 2개, OPEN/CLOSED 포함)를 authorId+title로 조회 후 없을 때 생성한다. 지원 3개는 applicantId/recruitmentId 복합 키로 upsert한다.
- [x] 하나의 transaction으로 데이터 입력, catch에서 실패 exit code, finally에서 disconnect를 수행한다.
- [x] `npx prisma db seed` 두 번 실행하고 실제 행 수 3/6/3과 id 유지 여부를 확인한다.
- [x] DBeaver/psql/Prisma Studio 중 하나로 실제 데이터 확인. SQL 안내에는 PK/FK/unique/enum 조회와 모집글/지원 join을 포함한다.
- [x] seed/config 별도 TypeScript 검사, 기존 `format:check`, `lint`, `build` 실행.

## Task 3: 교육 안내, 검토와 커밋

- [x] README에 16차시 안내 링크를 추가한다. 학생 순서를 validate, format, migrate, SQL 열기, 테이블/제약 확인, generate, seed, row 확인 순으로 작성한다.
- [x] model/field/id/default/unique/relation/enum/time/map/복합 unique/cascade와 migration/seed의 의미를 간단히 설명한다.
- [x] 17차시에서 PrismaModule/PrismaService를 연결하고 RecruitmentsService 메서드를 DB 쿼리로 바꾼다는 경계를 명시한다.
- [x] 검증 결과와 미완료 항목을 사실대로 기록하고 전체 diff를 검토한 후 별도 커밋한다.

## Execution ledger

- 원본 `a16fe78`의 clean 상태 확인. 새 worktree와 브랜치 생성 완료.
- 사용자 제공 설계/실행 요청을 기준으로 추가 설계 승인 단계 없이 본 계획을 작성하고 직접 실행한다.
- Docker named pipe 접근 거부. 권한 도구는 해당 경로를 `permission path cannot be represented losslessly`로 거절. 사용자에게 15차시 컨테이너 실행을 요청함. 최초 localhost:5432 연결 실패.
- npm 캐시는 쓰기 가능한 현재 작업의 `work/npm-cache`를 사용한다.
- Task 1 complete: 사용자 컨테이너 실행 응답 후 5432 접속 성공. PostgreSQL 17.11 / campus_crew 확인. validate/format/generate 성공. `20260919105521_init` 생성 및 적용, migrate status 동기화 성공.
- Task 2 ruling: tsx 4.23.13은 이 Windows 환경의 `os.userInfo()` 호출에서 실패하여 ts-node 10.9.2로 교체. `ts-node --project tsconfig.prisma.json prisma/seed.ts`를 config에 지정하며 학생의 db seed 명령은 유지한다.
- Task 2 complete: seed 전 0/0/0에서 기대 행 수 3/6/3 검증 실패를 확인. 구현 후 seed 두 번 성공, 실제 3/6/3 및 전체 ID/값 동일성 검증 통과. unique/FK/enum/cascade SQL 동작 검증과 rollback 복원 확인. Prisma Studio 화면에서도 실제 세 테이블/행 확인. db:typecheck 통과.
- Task 3 verification: npm run check 전체 성공(format:check/lint/build). apps/api/src, apps/web, ERD, Compose 보존 확인. 별도 리뷰에서 중요 결함 없음; 계획의 실행기와 진행 상태를 최신화.
- 제한: npm audit의 Prisma CLI 하위 의존성 high 4건을 문서화. Prisma 7 고정 요구에 반하는 major 변경은 수행하지 않음.
- 최종 작업은 별도 커밋 후 브랜치/worktree 보존. 기존 커밋 수정, merge/push, 파괴적 Git 명령 없음.
