# 16차시 — Prisma schema, Migration, Seed

14차시 [ERD](erd.md)를 코드로 표현하고, 15차시 [Docker PostgreSQL](session-15-local-database.md)에 실제 테이블과 기본 데이터를 만듭니다. DB는 준비되지만 **NestJS API는 아직 in-memory**입니다. DB 행을 수정해도 현재 API 응답은 바뀌지 않습니다.

## 버전과 파일

- `prisma`, `@prisma/client`, `@prisma/adapter-pg`: **7.10.0** (2026-09-19 npm registry에서 확인한 최신 안정 7.x)
- `pg`: **8.23.0**, `dotenv`: **18.0.1**
- `ts-node`: **10.9.2**, `@types/pg`: **8.23.1**
- 정확한 버전은 `apps/api/package.json`과 루트 `package-lock.json`에 고정합니다. 무조건 `@latest`로 설치하면 다른 major가 선택될 수 있습니다.
- `apps/api/prisma/schema.prisma`: 모델과 enum
- `apps/api/prisma.config.ts`: schema/migrations 위치, DB URL, 명시적 seed 명령
- `apps/api/prisma/migrations/20260919105521_init/migration.sql`: 생성·적용된 SQL 이력
- `apps/api/prisma/seed.ts`: 개발 기본 데이터
- `apps/api/generated/prisma`: 생성된 Client, Git 제외

Prisma 7의 `prisma-client` generator는 output 경로를 지정합니다. 이 저장소는 기존 NestJS의 CommonJS 구성에 맞춰 `moduleFormat = "cjs"`를 사용합니다. datasource에는 `provider = "postgresql"`만 두고, 연결 URL은 `prisma.config.ts`에 설정합니다. seed의 `PrismaClient`에는 `PrismaPg` adapter를 전달합니다. [Prisma 7 업그레이드 안내](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7)

## 준비

저장소 루트에서 `npm ci`를 실행합니다. 이미 있는 `.env`는 보존합니다. 없을 때만 루트 `.env.example`을 `.env`로 복사합니다.

```powershell
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d
docker compose ps
docker compose exec postgres pg_isready -U campus_crew -d campus_crew
```

기본 로컬 연결은 `localhost:5432`, database/user/password 모두 `campus_crew`입니다. 루트 `.env`의 `DATABASE_URL`이 `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`와 일치해야 합니다. 실제 비밀번호에 URL 예약 문자가 있으면 URL 인코딩합니다.

Prisma CLI와 seed는 파일 위치를 기준으로 **저장소 루트 `.env`**를 읽습니다. 이미 설정된 프로세스 환경 변수가 우선하며, `apps/api/.env`는 기존 API PORT 설정용입니다. 루트 `.env`는 Git에 올리지 않습니다.

여러 차시 worktree를 쓰면 Compose 기본 프로젝트 이름이 폴더별로 달라져 서로 다른 volume/container가 생길 수 있습니다. 이 구현 검증에서는 **기존 15차시 폴더에서 실행한 PostgreSQL**에 16차시 worktree로 접속했습니다. 기존 컨테이너가 5432를 사용 중이라면 원래 실행한 폴더에서 관리하고, 16차시 폴더에서 같은 포트의 두 번째 컨테이너를 만들지 않습니다.

## 학생 확인 순서

1. `cd apps/api` 후 schema 검증:

   ```bash
   npx prisma validate
   ```

2. schema 정렬:

   ```bash
   npx prisma format
   ```

3. migration 생성·적용:

   ```bash
   npx prisma migrate dev --name init
   ```

   이 checkpoint에는 init migration이 이미 포함되어 있습니다. 새 DB에서는 기존 migration을 적용하고, 이미 적용한 DB에서는 변경이 없다고 나오는 것이 정상입니다. 이름이 같은 새 migration을 매번 만드는 명령은 아닙니다. DB 초기화/reset 요청이 나오면 승인하지 말고 현재 DB와 migration 이력이 왜 다른지 먼저 확인합니다.

4. `prisma/migrations/20260919105521_init/migration.sql`을 엽니다. `CREATE TYPE`, `CREATE TABLE`, `CREATE UNIQUE INDEX`, `ALTER TABLE ... FOREIGN KEY`를 schema와 비교합니다.

5. DBeaver에서 연결을 새로고침(F5)하고 `campus_crew → Schemas → public → Tables`의 `users`, `recruitments`, `applications`를 확인합니다. `_prisma_migrations`는 Prisma 이력 관리 테이블입니다.

6. 각 테이블의 Properties에서 PK, Foreign Keys, Indexes를 확인합니다. [확인 SQL](session-16-verify.sql)을 SQL Editor에서 실행하면 enum, 제약조건, unique 인덱스를 함께 확인할 수 있습니다. 초기 DB의 seed 전 행 수는 0/0/0입니다.

7. Client를 생성한 다음 seed를 **명시적으로** 실행합니다:

   ```bash
   npx prisma generate
   npx prisma db seed
   ```

   Prisma 7의 `migrate dev`는 Client 생성이나 seed를 자동 실행하지 않습니다. 생성 파일은 커밋하지 않으므로 새로 clone하거나 schema를 바꾼 뒤 `generate`가 필요합니다. [Prisma 7 seeding 문서](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/seeding)

8. DBeaver Data 탭을 새로고침하고 실제 행을 확인합니다. 빈 DB 기준 User 3명, Recruitment 6개, Application 3개입니다. `npx prisma db seed`를 다시 실행해도 행 수와 기존 값이 유지되는지 확인합니다.

9. 선택적으로 `npx prisma studio`를 실행해 브라우저에서도 확인할 수 있습니다. Studio는 필수가 아니며 DBeaver로 실습을 완료할 수 있습니다.

루트에서 실행할 때는 다음 workspace 스크립트를 사용합니다:

```bash
npm run db:generate --workspace=@campus-crew/api
npm run db:migrate --workspace=@campus-crew/api -- --name init
npm run db:seed --workspace=@campus-crew/api
npm run db:typecheck --workspace=@campus-crew/api
```

## schema 읽기

| 문법                                     | 의미                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `model` / field                          | 테이블 / 컬럼. relation 필드는 연결을 표현하며 배열 컬럼을 만들지는 않음                           |
| `@id @default(autoincrement())`          | PK와 자동 증가 정수 ID                                                                             |
| `email @unique`                          | 같은 이메일 중복 금지                                                                              |
| `authorId` + `@relation(...)`            | FK 컬럼과 User 관계                                                                                |
| enum                                     | category/status에 허용되는 값 제한                                                                 |
| `@default(now())`                        | 생성 시각 기본값                                                                                   |
| `@updatedAt`                             | Prisma Client가 수정할 때 갱신하는 시각. DB trigger가 아니므로 직접 SQL 수정 시 자동 갱신되지 않음 |
| `@@map("users")`                         | 코드의 `User` 모델을 DB의 `users` 테이블로 연결                                                    |
| `@@unique([applicantId, recruitmentId])` | 같은 사용자의 같은 모집글 중복 지원 금지                                                           |
| `onDelete: Cascade`                      | 모집글을 삭제하면 해당 모집글의 지원도 삭제                                                        |

관계는 `User 1:N Recruitment`, `User 1:N Application`, `Recruitment 1:N Application`입니다. Application은 message/status를 가진 독립 모델입니다. 사용자 삭제는 연결된 모집글/지원이 있으면 기본 RESTRICT로 거부됩니다.

**Migration**은 schema 변경을 SQL 이력으로 남깁니다. 이미 적용·공유한 migration을 수정하는 대신, 다음 schema 변경에 새 migration을 만듭니다. **Seed**는 개발·실습용 기본 데이터이며 schema 변경 이력과 목적이 다릅니다.

## Seed 구성과 반복 실행

- 사용자: `teacher@example.com`, `student1@example.com`, `student2@example.com`
- 모집글: TypeScript 기초 스터디, 알고리즘 문제 풀이 스터디, Campus Crew 웹 프로젝트, 동아리 일정 관리 프로젝트, 교내 해커톤 참가팀, 공공데이터 활용 공모전
- category는 STUDY/PROJECT/CONTEST 각 2개, status는 OPEN 4개/CLOSED 2개
- 지원: student1 → TypeScript(PENDING), student2 → Campus Crew(APPROVED), student1 → 해커톤(REJECTED)
- passwordHash는 `PLACEHOLDER_NOT_A_REAL_PASSWORD_HASH`. 로그인 가능한 비밀번호 해시가 아닙니다.

User는 email upsert, Application은 복합 unique upsert를 사용합니다. Recruitment는 작성자+제목을 조회하고 없을 때만 생성합니다. 고정 ID나 전체 삭제를 사용하지 않고 하나의 transaction으로 넣습니다. 기존 데이터의 수정 내용도 보존합니다.

교육용 단순 전략이므로 seed는 한 번에 한 프로세스씩 실행합니다. 작성자/제목을 바꾸면 새 seed 모집글이 만들어질 수 있고, 동시에 여러 seed를 실행하는 경우까지 중복을 보장하는 전략은 아닙니다. 실제 데이터가 이미 있으면 전체 행 수는 3/6/3보다 많을 수 있습니다.

## 검증 기록

- 2026-09-19: 사용자 PC에서 기존 15차시 Compose 실행 완료 후 TCP 5432 접속 성공. 실제 DB는 PostgreSQL **17.11**, database/user 모두 `campus_crew`.
- Prisma validate/format/generate 성공, migration `20260919105521_init` 적용 성공, migrate status에서 동기화 확인.
- seed 전 0/0/0 확인 후 seed 두 번 성공. 3/6/3과 전체 행 ID/값 유지 확인.
- 실제 SQL에서 PK/FK/unique/enum 확인. 중복 email·중복 지원 거부(23505), 잘못된 FK 거부(23503), enum 거부(22P02), 모집글 삭제 시 지원 cascade 확인. 동작 검증의 변경은 transaction rollback으로 복원.
- 생성 Client와 seed/config TypeScript 검사 통과.
- Prisma Studio에서 users 3행, recruitments 6행, applications 3행 및 migration 완료 행을 직접 확인. DBeaver GUI는 대신 실행하지 않았으며 학생용 접속/SQL 순서를 위에 제공.
- 루트 `npm run check` 성공: `format:check`, API/web `lint`, NestJS/Next.js `build` 모두 통과.
- 기준 커밋 대비 `apps/api/src`, `apps/web`, `compose.yaml`, `docs/erd.md` 변경 없음. 기존 lockfile에 있던 동일 경로 패키지의 버전 변경 없음.

설치 시 `npm audit`에 Prisma CLI 하위 의존성(`deepmerge-ts`, `mysql2` 및 상위 경로 포함) high 4건이 보고되었습니다. Prisma 7 유지 요구에 따라 major 변경이나 강제 의존성 교체는 하지 않았습니다. 해당 경고는 이후 Prisma 7 패치 여부를 확인할 항목입니다.

처음 사용한 `tsx`가 이 PC의 제한된 Windows 환경에서 `os.userInfo()` 오류를 일으켜, seed 실행기를 `ts-node`로 고정했습니다. 학생 명령은 동일하게 `npx prisma db seed`입니다.

## 다음 17차시

PrismaModule/PrismaService를 Nest에 연결하고 생성된 PrismaClient에 `PrismaPg` adapter를 주입합니다. 이후 RecruitmentsService의 배열 조회·생성을 `findMany`, `findUnique`, `create`로 교체하고 async 처리 및 기존 응답 형태/404 동작을 유지합니다. 이때 API가 DB 데이터를 사용하게 됩니다. 이번 차시에는 NestJS Service, auth/JWT/bcrypt 가입 로직, TanStack Query를 추가하지 않습니다.
