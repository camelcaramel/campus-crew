# 17차시 — Prisma로 Recruitment CRUD 완성하기

이제 요청은 `Controller → RecruitmentsService → PrismaService → PostgreSQL`로 흐릅니다. Service의 배열과 `nextId`는 제거했습니다. API를 다시 실행해도 DB의 모집글은 유지됩니다. 프론트엔드는 아직 mock 데이터를 사용합니다.

## 시작하기

저장소 루트에서 실행합니다. 기존 `.env`는 보존하세요.

```powershell
npm ci
if (!(Test-Path .env)) { Copy-Item .env.example .env }
docker compose up -d
docker compose ps
docker compose exec postgres pg_isready -U campus_crew -d campus_crew
npm run db:generate --workspace=@campus-crew/api
npm run db:migrate --workspace=@campus-crew/api -- --name init
npm run db:seed --workspace=@campus-crew/api
npm run dev:api
```

16차시에서 migration과 seed를 완료했다면 DB 실행과 연결만 확인하면 됩니다. 위 migrate 명령은 기존 migration을 적용합니다. DB reset 요청은 현재 데이터와 이력을 먼저 확인해야 하는 신호입니다.

**이 PC의 차시별 worktree:** 15차시에서 실행한 기존 PostgreSQL을 공유합니다. 같은 5432 포트에 새 컨테이너를 만들지 마세요. Docker 상태/시작 명령은 처음 컨테이너를 실행한 15차시 폴더에서 실행하고, API 명령은 17차시 폴더에서 실행합니다.

기본 API 주소는 `http://localhost:4000`, Swagger는 [http://localhost:4000/docs](http://localhost:4000/docs)입니다. `/docs-json`에는 OpenAPI 명세가 있습니다. `apps/api/.env`의 PORT 또는 프로세스 PORT로 변경할 수 있습니다.

API/Prisma CLI/seed가 같은 루트 `.env`의 `DATABASE_URL`을 사용합니다. API는 프로세스 환경 변수 → `apps/api/.env` → 루트 `.env` 순으로 값을 선택합니다. 혼동을 피하려면 DATABASE_URL은 루트에 두고 API 파일에는 PORT만 둡니다.

## PrismaService와 모듈

`apps/api/src/prisma/prisma.service.ts`는 `@Injectable()` 클래스이며 `PrismaClient`를 상속합니다. 생성자에서 기존 Prisma 7의 `PrismaPg` adapter를 전달하고, `onModuleInit()`에서 `$connect()`합니다. `PrismaModule`은 이를 provider로 등록하고 export합니다. `RecruitmentsModule`이 import하고 Service 생성자에서 주입받습니다.

```ts
constructor(private readonly prisma: PrismaService) {}
```

Nest의 기본 provider는 한 앱에서 재사용됩니다. 각 HTTP 요청에서 `new PrismaClient()`를 만들 필요가 없습니다. 공식 [NestJS Prisma 안내](https://docs.nestjs.com/recipes/prisma)와 같은 Injectable 패턴을 사용합니다.

16차시 Client 생성 위치(`apps/api/generated/prisma`)와 schema는 보존했습니다. 생성된 TypeScript까지 함께 컴파일하도록 API `rootDir`를 `.`으로 넓혔습니다. 따라서 빌드 결과는 `dist/src/main.js`이며 `npm run start:api`가 이 파일을 실행합니다. dev/build 전 `prisma generate`를 자동 실행합니다. 생성 파일은 Git에 포함하지 않습니다.

## 다섯 endpoint

| 요청                           | Service 메서드     | Prisma API                 | 성공 응답      |
| ------------------------------ | ------------------ | -------------------------- | -------------- |
| GET `/api/recruitments`        | `findAll()`        | `recruitment.findMany()`   | 200, 배열      |
| GET `/api/recruitments/:id`    | `findOne(id)`      | `recruitment.findUnique()` | 200, 객체      |
| POST `/api/recruitments`       | `create(body)`     | `recruitment.create()`     | 201, 생성 객체 |
| PATCH `/api/recruitments/:id`  | `update(id, body)` | `recruitment.update()`     | 200, 수정 객체 |
| DELETE `/api/recruitments/:id` | `remove(id)`       | `recruitment.delete()`     | 204, body 없음 |

Prisma는 TypeScript 객체의 `where`, `data`, `include`를 통해 SQL query를 표현합니다. 직접 SQL 문자열을 작성하지 않아도 됩니다. DB 작업은 비동기이므로 Promise를 반환하거나 await합니다.

```ts
return this.prisma.recruitment.findMany({
  orderBy: { id: 'asc' },
  include: { author: { select: { id: true, name: true } } },
});
```

`include`는 연결된 author를 가져오고, 내부 `select`는 id/name만 선택합니다. 작성자의 email/passwordHash는 응답에 포함하지 않습니다. 모집글의 authorId, createdAt, updatedAt은 함께 반환합니다.

## POST와 PATCH

POST body 예시입니다. authorId는 GET 목록의 실제 `author.id`를 사용하세요. DB를 새로 seed하면 보통 1부터 시작하지만 고정 ID에 의존하지 않습니다.

```json
{
  "title": "React 스터디 팀원 모집",
  "content": "주 1회 함께 공부할 팀원을 모집합니다.",
  "category": "STUDY",
  "authorId": 1
}
```

id는 DB가 생성하고 status는 schema 기본값 OPEN입니다. 아직 인증이 없어서 body의 authorId를 받습니다. 이후 auth 차시에서는 로그인 사용자 id로 교체하고 작성자 권한을 검사합니다. 현재 authorId 검사는 사용자의 존재만 확인하며 인증·권한 검사는 아닙니다.

PATCH는 바꿀 필드만 보냅니다.

```json
{
  "title": "React 스터디 모집 마감",
  "status": "CLOSED"
}
```

title/content/category/status만 수정할 수 있습니다. 생략한 필드는 undefined가 되어 Prisma가 그대로 유지합니다. 빈 `{}`는 기존 값을 유지합니다. `null`은 생략과 다릅니다. DTO는 문자열/enum 필드를 안내하며 null은 지원 입력이 아닙니다. body 전체를 Prisma에 넘기지 않으므로 id/authorId/author relation을 보내도 수정되지 않습니다.

DTO의 `ApiProperty`/`ApiPropertyOptional`은 Swagger 문서용입니다. 이 차시는 class-validator를 도입하지 않습니다. authorId 정수 검사와 경로 ParseIntPipe를 제외한 전체 입력 검증(필수 문자열, 빈 문자열, enum/null/길이 등)은 후속 validation 차시에 다룹니다. 잘못된 필드 타입은 Prisma 오류로 500이 될 수 있으므로 수업에서는 위 DTO에 맞는 요청을 사용합니다.

## 404, 400, 204와 DB 제약조건

- 없는 모집글: GET은 조회 결과를 확인하고 `NotFoundException`을 던집니다. PATCH/DELETE는 Prisma의 행 없음(P2025)만 단순히 같은 404로 변환합니다. 별도 필터는 없습니다.
- authorId가 잘못된 정수이거나 사용자가 없으면 400입니다. 사전 조회 이후 사용자가 사라지는 경우에도 DB FK가 저장을 막으며 해당 P2003만 400으로 변환합니다.
- 숫자가 아닌 경로 id와 PostgreSQL Int 범위(-2147483648~2147483647)를 벗어나는 경로 id는 400입니다. 범위 안의 정수지만 행이 없으면 404입니다.
- DB의 FK/enum/unique는 데이터 무결성을 보장합니다. 앱의 존재 확인과 HTTP 예외는 사용자에게 이해하기 쉬운 응답을 주는 역할입니다. 두 역할은 서로 대체되지 않습니다.
- DELETE 204는 삭제에 성공했고 반환할 본문이 없다는 뜻입니다. 클라이언트는 204 응답에 `response.json()`을 호출하지 않습니다. 다시 GET/PATCH/DELETE하면 404입니다.
- 16차시 `onDelete: Cascade`는 유지되므로 모집글을 삭제하면 연결된 지원도 삭제됩니다. 실습에서는 새로 만든 모집글만 삭제하세요.

## Postman 실습 순서

[17차시 collection](postman/campus-crew-session-17.postman_collection.json)을 Import합니다. collection의 `baseUrl`은 기본 `http://localhost:4000`입니다. 환경 변수에 같은 이름이 있으면 이를 확인하세요.

1. Docker PostgreSQL 상태와 seed 데이터가 있는지 확인합니다.
2. `01 목록` GET: 실제 목록을 확인하고 첫 항목의 `seedId`, `authorId`를 자동 저장합니다.
3. `02 seed 상세` GET: 저장한 seedId로 조회합니다.
4. `03 생성` POST: authorId를 포함하고 새 `recruitmentId`를 자동 저장합니다.
5. `04 생성 후 목록` GET: 새 항목이 포함됐는지 검사합니다.
6. `05 수정` PATCH: 제목과 status를 CLOSED로 변경합니다.
7. `06 수정 후 상세` GET: 수정값을 확인합니다.
8. **영속성 실습:** 여기에서 API 터미널을 Ctrl+C로 종료하고 `npm run dev:api`로 다시 실행합니다. `06 수정 후 상세`를 재전송하면 같은 id/수정값이 남아 있습니다. DB는 계속 실행합니다.
9. `07 삭제` DELETE: 새 모집글만 삭제하며 204를 확인합니다.
10. `08 삭제 후 상세` GET: 404를 확인합니다. `09 seed 유지 확인` GET으로 기존 DB 데이터가 계속 남아 있음을 확인합니다.

Collection Runner에서는 01–09를 순서대로 실행합니다. Runner는 API 프로세스를 재시작하지 않으므로 8번 영속성 실습은 수동으로 진행합니다. 테스트를 반복하면 새 모집글 ID가 증가합니다. PostgreSQL sequence는 삭제 후에도 숫자를 되돌리지 않습니다.

## 검증 명령

```bash
npm run build --workspace=@campus-crew/api
npm run test:e2e --workspace=@campus-crew/api
npm run db:typecheck --workspace=@campus-crew/api
npm run check
```

HTTP 테스트는 사용 가능한 임시 포트에 실제 API를 띄우고, 실제 DB를 직접 조회해 응답과 비교합니다. 별도 mock DB를 쓰지 않습니다. 테스트가 생성한 고유 제목/ID의 행만 정리하며 기존 users/recruitments/applications의 값이 유지됐는지 검사합니다. 같은 DB에서 다른 사용자가 동시에 실습하면 snapshot 검사가 실패할 수 있으므로 테스트는 실습이 잠시 멈춘 로컬 DB에서 실행합니다.

## 다음 18차시

현재 GET 목록과 상세는 DB 데이터를 반환합니다. 다음 차시에는 frontend mock 목록/상세를 이 두 endpoint로 연결하고 loading/error/empty/404 상태를 실제 응답과 연결합니다. author `{ id, name }`과 서버 timestamp를 프론트 타입에 반영하고, 브라우저에서 다른 포트로 호출할 경우 CORS 설정을 준비합니다. 이번 변경에는 frontend, TanStack Query, auth, 지원 기능, 검색·필터·페이지네이션이 없습니다.

## 실제 검증 기록 — 2026-09-19

- 기준 커밋: `dafb512` (16차시). 별도 브랜치 `feat/session-17-recruitment-prisma-crud`와 17차시 worktree에서 작업했습니다. 원본 16차시 worktree는 clean 상태이며 이전 커밋은 변경하지 않았습니다.
- PostgreSQL 17.11의 기존 `campus_crew` DB에 직접 접속했습니다. 사용자 3명 / 모집글 6개 / 지원 3개를 확인했고 최종 행 수도 같습니다.
- 변경 전 기존 HTTP 테스트 6개 통과. DB 기반 테스트를 먼저 추가했을 때 배열 응답/author 누락/PATCH·DELETE 없음 등 8개가 실패하여 변경 필요성을 확인했습니다.
- 최종 HTTP·실제 DB 테스트 **11/11 통과**: seed 조회/작성자 정보, POST, 선택 PATCH, 허용하지 않은 필드 무시, 404/400, DELETE 204, Swagger 및 API 재시작 영속성.
- POST한 행을 CLOSED로 PATCH한 뒤 API 프로세스를 실제 종료·재시작했습니다. 동일한 id와 수정값으로 GET 성공했고 seed도 유지됐습니다. 테스트가 만든 행만 정리한 뒤 기존 세 테이블의 snapshot이 동일함을 확인했습니다. 자동 증가 sequence 값은 실습에 따라 증가합니다.
- 개발 명령 `npm run dev:api`를 PORT=4177로 실행했습니다. `/docs`와 `/docs-json` 및 다섯 route를 확인했습니다. 제공한 Postman collection의 9개 요청/14개 assertion을 작은 HTTP 재실행 도구로 실제 개발 서버에 전달해 모두 통과했습니다. Postman GUI 자체를 조작한 검증은 아닙니다.
- `prisma generate`, `db:typecheck`, 루트 `npm run check` (`format:check`, API/web lint, NestJS/Next.js build) 모두 성공했습니다. 마지막 build 후에도 HTTP 테스트 11/11을 재확인했습니다.
- 독립 코드 검토에서 정수 범위를 벗어나는 경로 id의 500 응답을 발견했습니다. 재현 테스트의 `500 != 400` 실패를 먼저 확인하고 작은 범위 검사를 추가했으며 전체 테스트가 통과했습니다.
- `apps/web`, Prisma schema/migration/seed/config, `compose.yaml`, `package-lock.json`은 기준 커밋 대비 변경이 없습니다. 새 의존성을 추가하지 않았습니다.

환경 제한도 구분해서 기록합니다. 이 실행 환경에서는 Docker named pipe 접근이 거부되어 `docker compose ps`의 컨테이너 health 표시는 확인하지 못했습니다. DB TCP 접속과 실제 CRUD는 위와 같이 완료했습니다. 또한 제한된 Windows 환경에서 Nest watch가 파일 변경 후 자식 프로세스를 종료하려 할 때 `taskkill: Access denied`가 발생했습니다. 개발 서버를 새로 실행한 뒤 실제 요청 검증은 성공했지만, 이 샌드박스의 자동 재시작은 제한됩니다. 검증 서버는 종료했습니다.

설치 시 로컬 npm 캐시를 사용했습니다. Prisma 엔진 다운로드가 네트워크 제한으로 실패하여 16차시에 설치된 동일 버전 7.10.0의 엔진 파일을 새 worktree의 node_modules에 복사한 뒤 generate/build를 성공시켰습니다. 이 환경용 조치는 Git 변경에 포함되지 않습니다.
