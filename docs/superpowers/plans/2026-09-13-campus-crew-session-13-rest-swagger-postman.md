# Campus Crew Session 13 REST / Swagger / Postman Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track steps with checkboxes.

**Goal:** 학생이 GET/POST 요청, route, JSON body/response, 200/201/404를 실행하며 이해한다.

**Architecture:** 기존 RecruitmentsModule → Controller → Service 구조를 유지한다. Service 배열에 데이터를 추가하며 DB 없이 자동 증가 id와 기본 OPEN을 제공한다. 현재 global prefix가 없으므로 Controller 경로를 api/recruitments로 변경하고 기존 GET / 응답은 유지한다.

**Tech Stack:** npm workspaces, NestJS 11, TypeScript, @nestjs/swagger, Node 내장 HTTP 테스트.

**Spec:** 이 작업의 사용자 요청에 명시된 13차시 요구사항 전체. 기준 커밋은 f477d60 (12차시), 작업 브랜치는 feat/session-13-rest-swagger-postman이다.

## Global Constraints

- 4~12차시 코드와 커밋을 보존하고 별도 worktree에서만 수정한다.
- GET /api/recruitments, GET /api/recruitments/:id, POST /api/recruitments를 제공한다.
- POST 입력은 title, content, category. 반환값은 생성된 객체이며 id는 서버 증가, status는 OPEN이다.
- 존재하지 않는 상세는 NotFoundException, POST 성공은 Nest 기본 201이다.
- any, DB/Prisma/PostgreSQL/migration, class-validator/validation decorator, auth/JWT, PATCH/DELETE, 커스텀 에러, repository abstraction을 추가하지 않는다.
- Swagger는 /docs, title Campus Crew API, version 1.0, 학생용 한국어 설명을 사용한다.
- Swagger decorator는 ApiTags와 POST 입력 필드를 보여주는 ApiProperty 3개로 제한한다. 별도 응답 DTO나 CLI plugin은 추가하지 않는다.
- 프론트엔드와 기존 환경/포맷/린트/빌드 설정은 변경하지 않는다.
- 파괴적 Git 명령을 사용하지 않고 feat: add recruitment rest api and swagger 새 커밋을 남긴다.

## Task 1: REST API와 실행 검증

**Files:**

- Modify: apps/api/src/modules/recruitments/recruitments.controller.ts
- Modify: apps/api/src/modules/recruitments/recruitments.service.ts
- Create: apps/api/src/modules/recruitments/create-recruitment.dto.ts
- Create: apps/api/test/recruitments.e2e.mjs

**Interfaces:** findAll(): Recruitment[], findOne(id: number): Recruitment, create(body: CreateRecruitmentDto): Recruitment. Recruitment에 content: string을 추가한다. DTO에는 title: string, content: string, category: 'STUDY' | 'PROJECT' | 'CONTEST'를 둔다.

- [x] 기존 lockfile로 의존성을 설치하고 format:check / lint / build 기준 상태를 확인한다.
- [x] Node 내장 node:test와 fetch로 실제 빌드 서버를 임시 포트에 띄우는 테스트를 먼저 작성한다. 목록 200, id 1 상세 200, 없는 id 404, POST 201 및 JSON 일치, 연속 생성 id 증가, GET 목록/상세 반영, 입력 id/status가 서버 값을 덮어쓰지 못함을 검증한다. 기존 GET /도 확인한다.
- [x] `node --test apps/api/test/recruitments.e2e.mjs`를 실행하여 미구현 route 때문에 실패함을 확인한다.
- [x] 초기 데이터 3개의 id/title/category/status를 유지하면서 content를 추가한다. `private nextId = 4`를 두고 create에서 명시적으로 필드를 선택한다.

```typescript
const recruitment: Recruitment = {
  id: this.nextId++,
  title: body.title,
  content: body.content,
  category: body.category,
  status: 'OPEN',
};
this.recruitments.push(recruitment);
return recruitment;
```

- [x] findOne은 배열 find 후 없으면 `throw new NotFoundException('모집글을 찾을 수 없습니다.')`를 실행한다. Controller는 `@Param('id') id: string`을 `Number(id)`로 바꿔 전달한다.
- [x] Controller는 `@Controller('api/recruitments')`, `@Get()`, `@Get(':id')`, `@Post()`, `@Body()`로 Service에 위임한다. HttpCode를 덧붙이지 않는다.

## Task 2: Swagger와 학습 자료

**Files:**

- Modify: apps/api/package.json, package-lock.json
- Modify: apps/api/src/main.ts
- Modify: apps/api/src/modules/recruitments/create-recruitment.dto.ts
- Modify: apps/api/src/modules/recruitments/recruitments.controller.ts
- Create: docs/session-13-checkpoint.md
- Create: docs/postman/campus-crew-session-13.postman_collection.json

- [x] NestJS 11에 호환되는 @nestjs/swagger를 API workspace에 정확한 버전으로 설치한다. 필요 없는 swagger-ui-express, validation 패키지는 설치하지 않는다.
- [x] main.ts에서 DocumentBuilder로 title/description/version을 설정하고 `SwaggerModule.createDocument(app, config)`, `SwaggerModule.setup('docs', app, document)`를 호출한다.
- [x] `@ApiTags('recruitments')`와 DTO의 필드별 ApiProperty(example, category enum)만 추가한다. 이는 문서용이고 런타임 검증이 아님을 문서에 설명한다.
- [x] HTTP 테스트에 /docs HTML, /docs-json의 세 route와 POST 201, POST body의 세 필드 schema 확인을 포함한다.
- [x] Postman collection에 baseUrl=http://localhost:4000을 두고 사용자 지정 순서 5개 요청과 상태/응답 assertions를 작성한다. POST 응답 id를 collection variable에 저장하고 마지막 목록에서 그 객체를 확인한다.
- [x] checkpoint에 설치/실행 명령, 경로 변경(/recruitments → /api/recruitments), Swagger Try it out, Postman 순서, 입력 예시, 기본 응답, 재시작 초기화, 타입과 런타임 검증의 차이를 기록한다.

## Task 3: 최종 검증과 커밋

- [x] 변경 파일만 Prettier로 정리한 후 `npm run format:check`, `npm run lint`, `npm run build`, `node --test apps/api/test/recruitments.e2e.mjs`를 실행한다.
- [x] `npm run dev:api`로 dev 서버를 실행하고 5개 HTTP 시나리오 및 /docs 접근을 확인한다. 테스트 포트와 결과를 checkpoint에 기록한다. 재시작 후 초기 데이터 3개로 돌아오는지도 확인한다.
- [x] requesting-code-review에 따라 읽기 전용 검토를 수행하고 필요한 수정만 반영한다.
- [x] `git diff --check`, 변경 목록, 기존 apps/web와 Module/AppModule 보존, 기준 브랜치 HEAD/상태를 확인한다.
- [x] 검증 결과를 문서에 기록하고 새 커밋 `feat: add recruitment rest api and swagger`를 만든다. 기존 브랜치와 worktree는 그대로 둔다.
