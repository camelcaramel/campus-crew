# 12차시 — NestJS Module / Controller / Service

## 실행과 확인

12차시 worktree 루트에서 실행합니다.

```bash
npm ci
npm run dev:api
```

기본 포트에서 브라우저 또는 Postman으로 다음 요청을 보냅니다.

- GET http://localhost:4000/ — 기존 API 시작 응답
- GET http://localhost:4000/recruitments — 모집글 배열

기존 main.ts에는 global prefix가 없습니다. 따라서 이번 주소는 /recruitments이며 /api/recruitments가 아닙니다. PORT를 바꾸면 URL의 포트도 바꿉니다.

```json
[
  {
    "id": 1,
    "title": "TypeScript 스터디 팀원 모집",
    "category": "STUDY",
    "status": "OPEN"
  },
  {
    "id": 2,
    "title": "캠퍼스 서비스 프로젝트 팀원 모집",
    "category": "PROJECT",
    "status": "OPEN"
  },
  {
    "id": 3,
    "title": "대학생 공모전 팀원 모집",
    "category": "CONTEST",
    "status": "CLOSED"
  }
]
```

## 파일을 세 가지 역할로 나누는 이유

모집글 기능에 필요한 클래스들을 modules/recruitments 아래 모읍니다. Module은 이 클래스들을 Nest에 등록하고 연결하여 기능의 경계를 보여줍니다. 파일을 모아놓는 것만으로 자동 등록되지는 않습니다.

| 파일                                                         | 역할                                                |
| ------------------------------------------------------------ | --------------------------------------------------- |
| apps/api/src/modules/recruitments/recruitments.module.ts     | Controller와 Service를 하나의 기능으로 등록         |
| apps/api/src/modules/recruitments/recruitments.controller.ts | URL과 HTTP method를 받아 Service에 처리 위임        |
| apps/api/src/modules/recruitments/recruitments.service.ts    | Recruitment interface, 메모리 데이터 3개, findAll() |
| apps/api/src/app.module.ts                                   | imports에 RecruitmentsModule을 넣어 앱과 연결       |

Controller에 데이터를 직접 넣으면 HTTP 처리와 데이터 처리가 섞입니다. 이번에는 Controller가 요청을 받고 Service가 데이터를 반환하도록 나눕니다. 다음에 데이터 조회 방식이 달라져도 각 역할을 찾기 쉽습니다.

## decorator 읽기

decorator는 클래스와 메서드에 Nest가 사용할 정보를 붙입니다.

| 코드                                | 의미                                              |
| ----------------------------------- | ------------------------------------------------- |
| @Module({ controllers, providers }) | 이 기능에서 사용할 Controller와 Provider 등록     |
| @Controller('recruitments')         | 이 Controller의 URL 경로 지정                     |
| @Get()                              | 해당 메서드를 GET 요청에 연결                     |
| @Injectable()                       | Nest의 의존성 주입으로 관리할 수 있는 클래스 표시 |

@Injectable()만 붙인다고 모든 Module에서 자동으로 사용할 수 있는 것은 아닙니다. RecruitmentsModule의 providers에도 Service를 등록합니다. AppModule에서는 해당 Module을 imports에 넣습니다. 다른 Module에 Service를 공개할 필요가 없어 exports는 추가하지 않습니다.

## constructor injection

```typescript
constructor(private readonly recruitmentsService: RecruitmentsService) {}
```

Controller가 필요한 Service를 생성자 인자로 선언하면 Nest가 등록된 Provider를 찾아 전달합니다. 이것이 dependency injection(의존성 주입)입니다. Controller에서 직접 new RecruitmentsService()를 호출하지 않고 객체 생성과 연결을 Nest에 맡깁니다.

private는 Controller 내부에서 사용하는 필드라는 뜻이며 readonly는 필드 재할당을 막습니다. 생성자 매개변수에 함께 쓰면 TypeScript가 필드를 선언하고 전달받은 값을 저장합니다.

## 실제 요청 흐름

```text
앱 시작 시:
AppModule → imports: RecruitmentsModule
  → controllers: RecruitmentsController
  → providers: RecruitmentsService
  → Nest가 Service를 Controller 생성자에 주입

요청 시:
Browser/Postman
  → GET /recruitments
  → RecruitmentsController.findAll()
  → RecruitmentsService.findAll()
  → Recruitment[] 반환
  → Nest가 JSON으로 응답
```

Module은 등록과 연결을 담당합니다. 각 HTTP 요청이 Module 메서드를 거쳐야 한다는 뜻은 아닙니다. Controller는 Service 반환값을 그대로 반환하며 res.json()을 직접 호출할 필요가 없습니다.

## 최소 TypeScript와 Mock 데이터

Recruitment interface는 id와 title의 타입, category와 status의 허용 문자열을 정의합니다. Recruitment[]는 그 형태의 객체 배열을 뜻합니다. Union Type 덕분에 카테고리 오타를 컴파일 단계에서 찾을 수 있습니다.

Service의 private readonly recruitments 배열은 DB 없이 서버 메모리에 있는 수업용 데이터입니다. readonly는 배열 자체를 다른 배열로 재할당하지 못하게 하며, 배열 요소까지 깊게 불변으로 만드는 것은 아닙니다. 이번에는 읽기 메서드만 제공합니다. 서버가 재시작되면 코드의 초기 데이터로 다시 시작합니다.

이번 API는 8~11차시 web Mock과 연결하지 않습니다. web의 기존 목록, 상세, 작성 폼, Loading/Empty/Error UI는 유지합니다.

## 학생 확인 과제

1. RecruitmentsModule의 controllers와 providers에서 두 클래스의 이름을 찾습니다.
2. AppModule의 imports에서 모집글 기능이 등록되는 위치를 찾습니다.
3. @Controller와 @Get을 함께 읽고 실제 URL을 설명합니다.
4. Controller의 findAll()에서 Service의 findAll()까지 따라갑니다.
5. Service의 title 하나를 바꾸고 dev 서버의 재컴파일 후 브라우저를 새로고침합니다.
6. constructor injection을 사용하면 객체를 누가 생성하고 전달하는지 설명합니다.

다음 차시에는 REST endpoint를 확장하고 Swagger/Postman으로 요청과 응답을 확인합니다. 이번에는 상세 조회, POST/PATCH/DELETE, DB/Prisma, DTO validation, Swagger 설정, 인증, 커스텀 예외 필터를 추가하지 않습니다.

## 검증 명령

```bash
npm run format:check
npm run lint
npm run build
git diff --check
```

npm run check는 위 세 npm 검사를 순서대로 실행합니다. lint와 build는 web/API 모두 포함합니다. API의 dev 실행은 npm run dev:api이며 Ctrl+C로 종료합니다.

## 실제 검증 결과

실행일: 2026-09-13. Windows, Node.js 22.17.1, npm 10.9.2.

| 검사              | 결과                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------- |
| 변경 전 baseline  | npm run check 종료 코드 0                                                                     |
| 구현 후 품질 검사 | format:check, web/API lint, web/API build 모두 통과. npm run check 종료 코드 0                |
| 구현 전 HTTP      | GET /는 200 및 기존 JSON 유지. GET /recruitments는 404여서 새 목록 응답 검사가 예상대로 실패  |
| 구현 후 dev 실행  | npm run dev:api watch 컴파일 오류 0개, RecruitmentsModule 초기화 및 GET route 등록 확인       |
| 구현 후 HTTP      | GET /recruitments는 200, application/json, 배열 3개, 고유한 정수 id 및 모든 필드/허용 값 확인 |
| 기존 API          | GET /의 기존 시작 응답 그대로 유지                                                            |
| 코드 리뷰         | 별도 읽기 전용 리뷰에서 수정이 필요한 사항 없음                                               |
| 보존              | apps/web, main.ts, package/lockfile 변경 없음. 11차시 worktree HEAD 6b4560b와 clean 상태 유지 |

실제 HTTP 검증에는 PORT=4012와 http://127.0.0.1:4012/recruitments를 사용했습니다. 검증용 서버는 확인 후 종료했습니다. 기본 실행 포트는 기존과 동일한 4000입니다. 자동 HTTP 검사는 응답 상태, JSON 형태 및 데이터 필드를 검사했으며 저장소에 새 테스트 의존성을 추가하지 않았습니다.

이 환경에서는 npm의 기존 전역 prefix 경로 문제를 피하도록 현재 터미널에만 설정했습니다. 설치는 이전 차시 캐시를 사용해 성공했습니다.

```powershell
$env:npm_config_prefix = 'C:\Program Files\nodejs'
$env:npm_config_cache = 'C:\Users\v2008\Documents\Codex\2026-09-13\referenced-chatgpt-conversation-this-is-an-3\work\npm-cache'
npm ci --offline --no-audit --no-fund
npm run check
$env:PORT = '4012'
npm run dev:api
```

기존 ESLint 의존성의 deprecation 경고와 이 PC의 전역 Git ignore 파일 읽기 권한 경고가 있었으나 설치·검사·Git 작업에는 실패가 없었습니다. 의존성 버전과 전역 설정은 변경하지 않았습니다.

## 작업 기준점

11차시 커밋 6b4560b에서 feat/session-12-recruitments-nest-module 브랜치와 별도 worktree를 생성했습니다. 기존 커밋을 수정하지 않으며 새 커밋 메시지는 feat: add recruitments nest module입니다.

계획: [12차시 구현 계획](superpowers/plans/2026-09-13-campus-crew-session-12-nest-module-controller-service.md).
