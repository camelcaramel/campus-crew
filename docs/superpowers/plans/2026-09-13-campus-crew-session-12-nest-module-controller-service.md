# Campus Crew Session 12 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track the steps below.

**Goal:** NestJS의 Module → Controller → Service 구조를 작은 모집글 목록 API로 설명한다.

**Architecture:** AppModule이 RecruitmentsModule을 import한다. RecruitmentsModule은 HTTP 진입점인 RecruitmentsController와 데이터 반환을 맡는 RecruitmentsService를 등록한다. Controller는 constructor injection으로 Service를 받아 목록을 반환한다.

**Tech Stack:** 기존 npm workspaces, TypeScript 5.9.3, NestJS 11.2.3, Node.js 22.17.1, npm 10.9.2.

**Spec:** 사용자가 지정한 12차시 요구사항. 기존 main.ts에는 global prefix가 없으므로 GET /recruitments를 사용한다. GET / 상태 응답과 4~11차시 코드를 보존한다.

## Global Constraints

- 기준 커밋: 11차시 6b4560b. 별도 브랜치 feat/session-12-recruitments-nest-module 및 별도 worktree에서 실행.
- 기존 커밋 수정 및 파괴적 Git 명령 사용 금지.
- DB/Prisma, DTO validation, Swagger, 인증, 쓰기 API, repository abstraction 추가 금지.
- 의존성, lockfile, main.ts, web 코드 및 기존 수업 문서를 수정하지 않는다.
- 최소 interface를 Service 파일에 정의하며 any를 사용하지 않는다.
- 선택적인 상세 API는 다음 차시에 남겨 목록 흐름에 집중한다.

## Task 1: 모집글 목록과 Module 연결

**Files:**

- Create: apps/api/src/modules/recruitments/recruitments.module.ts
- Create: apps/api/src/modules/recruitments/recruitments.controller.ts
- Create: apps/api/src/modules/recruitments/recruitments.service.ts
- Modify: apps/api/src/app.module.ts

**Interfaces:**

```typescript
export interface Recruitment {
  id: number;
  title: string;
  category: 'STUDY' | 'PROJECT' | 'CONTEST';
  status: 'OPEN' | 'CLOSED';
}
// Service: findAll(): Recruitment[]
// Controller: findAll(): Recruitment[]
```

- [x] 기존 캐시로 npm ci --offline --no-audit --no-fund 실행. npm run check로 변경 전 baseline 확인.
- [x] 기존 API를 빌드하여 임시 포트에서 실행. GET /는 200, GET /recruitments는 구현 전 404임을 확인.
- [x] Service에 위 interface 및 private readonly recruitments: Recruitment[] 배열을 정의. id 1/2/3, STUDY/PROJECT/CONTEST 각 한 개, OPEN/OPEN/CLOSED로 구성. findAll()은 this.recruitments를 반환.
- [x] Controller에 @Controller('recruitments'), @Get(), constructor(private readonly recruitmentsService: RecruitmentsService) 추가. findAll()은 Service의 findAll()만 호출.
- [x] Module에 @Module({ controllers: [RecruitmentsController], providers: [RecruitmentsService] }) 선언. AppModule imports에 RecruitmentsModule 추가.
- [x] 추가 파일만 포맷하고 npm run check 실행.
- [x] npm run dev:api로 실행하여 GET /recruitments의 200, JSON content type, 배열 3개 및 각 필드 타입/허용 값을 검증. GET /의 기존 응답 유지 확인. 종료 시 이번 작업에서 실행한 프로세스만 종료.

단순 전달 함수별 단위 테스트나 새 테스트 프레임워크는 추가하지 않는다. 실제 HTTP 경계에서 Module 등록, DI 연결, route 및 JSON 응답을 함께 검증한다.

## Task 2: 학생용 checkpoint와 최종 검증

**Files:**

- Create: docs/session-12-checkpoint.md
- Update: 이 계획 파일의 진행 체크박스

- [x] checkpoint에 실행 명령, 실제 URL, Mock JSON 예시, decorator 4개, constructor injection, 요청 흐름을 설명.
- [x] Module은 등록과 연결을 담당하며 요청마다 실행되는 HTTP 단계가 아님을 설명. Mock은 Service 내부 메모리에 있고 DB 및 web 연결이 없음을 명시.
- [x] 다음 차시 REST endpoint 및 Swagger/Postman 확장 연결과 실제 검증 결과 기록.
- [x] npm run format:check, npm run lint, npm run build, git diff --check 통과 확인. 문서만 바뀌면 format:check와 diff 검사를 다시 실행.
- [x] 별도 코드 리뷰와 변경 목록 확인. apps/web 및 package/lockfile이 기준 커밋과 동일한지 확인.
- [x] 지정 파일만 stage하고 feat: add recruitments nest module 메시지로 새 커밋 생성. 기존 11차시 HEAD와 clean 상태 유지 확인.

## Environment Notes

이 PC의 npm prefix는 실행 터미널에서만 C:\Program Files\nodejs로 지정한다. 캐시는 이전 10차시 work/npm-cache를 재사용한다. 시스템 설정 및 저장소 설정은 변경하지 않는다. 기본 API 포트는 4000이며 검증 시 충돌을 피하려고 PORT=4012를 사용한다.
