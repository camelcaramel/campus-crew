# 13차시 — REST GET/POST · Swagger · Postman

## 이번 차시의 변화

12차시의 RecruitmentsModule → RecruitmentsController → RecruitmentsService 구조와 초기 모집글 3개를 유지하면서 상세 조회와 생성을 추가한다. DB 없이 Service의 배열에 보관한다.

12차시의 `GET /recruitments`는 이번 차시부터 `GET /api/recruitments`로 사용한다. 기존 전역 prefix 설정이 없으므로 모집글 Controller에만 `api/recruitments`를 지정했다. 기존 서버 상태 확인 `GET /`는 그대로다. 프론트엔드 Mock UI와 작성 폼은 이번 차시에 API와 연결하지 않는다.

## 설치와 실행

저장소 루트에서 실행한다. 기존 Node/npm 버전과 환경변수 설정을 그대로 사용한다.

```bash
npm ci
npm run dev:api
```

이번 차시에 추가한 직접 의존성은 API workspace의 `@nestjs/swagger@11.4.7`이다.

```bash
npm install @nestjs/swagger@11.4.7 --save-exact --workspace=@campus-crew/api
```

Swagger UI에 필요한 `swagger-ui-dist`는 하위 의존성으로 설치된다. `swagger-ui-express`, `class-validator`, `class-transformer`를 별도로 설치하지 않는다.

기본 서버 주소는 `http://localhost:4000`이다. `PORT` 또는 `apps/api/.env`로 바꿨다면 아래 주소의 포트도 함께 바꾼다.

| HTTP method | Route                   | 성공 응답                        |
| ----------- | ----------------------- | -------------------------------- |
| GET         | `/api/recruitments`     | 200 OK + 모집글 배열             |
| GET         | `/api/recruitments/:id` | 200 OK + 모집글 객체             |
| POST        | `/api/recruitments`     | 201 Created + 생성한 모집글 객체 |

존재하지 않는 상세 조회는 Nest의 `NotFoundException`을 통해 404 JSON 응답을 반환한다.

## Swagger에서 확인

1. [Swagger UI](http://localhost:4000/docs)를 연다. 제목은 `Campus Crew API`, 버전은 `1.0`이다.
2. `recruitments`의 GET 목록을 펼쳐 **Try it out → Execute**를 누른다.
3. GET 상세에 `1`을 입력해 실행하고, `999999`로 바꿔 404를 비교한다.
4. POST를 펼쳐 **Try it out**을 누르고 아래 JSON을 입력한 뒤 실행한다.
5. **Server response**의 code `201`과 JSON을 확인하고 GET 목록을 다시 실행한다.

```json
{
  "title": "React 스터디 팀원 모집",
  "content": "주 1회 함께 공부할 팀원을 모집합니다.",
  "category": "STUDY"
}
```

서버를 처음 실행한 직후 첫 POST의 응답 예시:

```json
{
  "id": 4,
  "title": "React 스터디 팀원 모집",
  "content": "주 1회 함께 공부할 팀원을 모집합니다.",
  "category": "STUDY",
  "status": "OPEN"
}
```

id는 서버가 4, 5, 6 순서로 증가시키므로 앞에서 생성한 횟수에 따라 달라진다. status는 서버가 OPEN으로 지정한다. 입력 필드만 명시적으로 복사하므로 body에 id나 status를 추가해도 서버 값을 덮어쓰지 않는다.

Swagger 설정은 [NestJS 공식 소개](https://docs.nestjs.com/openapi/introduction)를 따른다. DTO에는 문서의 body 필드를 표시하기 위한 `@ApiProperty` 3개만 사용하고 Controller에는 `@ApiTags('recruitments')`를 사용한다. 필드 문서화 방법은 [공식 Types and Parameters](https://docs.nestjs.com/openapi/types-and-parameters)를 참고한다.

## Postman 테스트 순서

`docs/postman/campus-crew-session-13.postman_collection.json`을 Import한다. Collection의 `baseUrl`은 `http://localhost:4000`이다. 서버를 실행한 상태에서 다음 순서로 Send하거나 Collection Runner로 실행한다.

1. **GET 목록:** `{{baseUrl}}/api/recruitments` → 200, JSON 배열. 초기 개수를 확인한다.
2. **GET 상세:** `{{baseUrl}}/api/recruitments/1` → 200, id 1 객체.
3. **GET 없는 id:** `{{baseUrl}}/api/recruitments/999999` → 404. 이는 의도한 정상 테스트 결과다.
4. **POST 생성:** `{{baseUrl}}/api/recruitments` → Body → raw → JSON, 위 예시 body 사용. `Content-Type: application/json`을 보내고 201과 생성 객체를 확인한다.
5. **GET 생성 후 목록:** `{{baseUrl}}/api/recruitments` → 200. 방금 반환된 id와 내용을 가진 항목이 목록에 있는지 확인한다.

Collection에는 상태 코드와 응답 확인 스크립트가 포함되어 있다. 4번은 생성 id를 collection variable에 저장하고, 5번은 해당 객체와 목록 개수 증가를 확인한다. 다른 클라이언트가 동시에 모집글을 만들지 않는 수업용 서버에서 순서대로 실행한다.

## 학생에게 설명할 핵심

- **HTTP method:** 같은 `/api/recruitments`라도 GET은 읽고 POST는 만든다.
- **Route:** `/api/recruitments/:id`의 id는 URL에서 받는 값이다. Controller는 문자열을 숫자로 바꿔 Service에 전달한다.
- **Request body:** POST로 보낼 데이터를 JSON에 담는다. `@Body()`는 이 값을 받는다.
- **Status code:** 조회 성공은 200, 생성 성공은 201, 없는 상세는 404다. POST에 `@HttpCode`를 따로 붙이지 않아 Nest 기본 201을 사용한다.
- **JSON response:** 목록은 배열이고 상세/생성은 객체다. POST 응답에는 서버가 정한 id와 status도 있다.
- **Swagger:** 서버의 API 목록과 입력 설명을 보고 브라우저에서 요청을 실행한다.
- **Postman:** 프론트엔드 없이 method, URL, headers, body를 직접 구성해 같은 API를 호출한다.
- **요청 흐름:** Swagger/Postman → Controller의 create → Service의 create → 배열 추가 → 201과 JSON.
- **메모리 데이터:** 서버를 종료하고 다시 실행하면 생성한 항목이 사라지고 초기 3개와 다음 id 4로 돌아간다. dev 모드에서 코드 수정으로 서버가 재시작될 때도 같다.
- **타입과 검증:** DTO의 TypeScript 타입과 Swagger 필드 설명은 실행 중 잘못된 입력을 차단하지 않는다. 이번 실습에서는 예시 모양의 JSON을 보낸다. 실제 요청의 필수 값/카테고리 검증은 다음 차시에서 배운다.

## 검증 명령

```bash
npm run format:check
npm run lint
npm run build
node --test apps/api/test/recruitments.e2e.mjs
```

HTTP 테스트는 빌드된 API를 빈 임시 포트에 실행하고 완료 후 종료한다. 테스트 전 `npm run build`가 필요하다.

## 검증 기록

변경 파일 10개:

- `apps/api/src/main.ts`: Swagger 초기화
- `apps/api/src/modules/recruitments/recruitments.controller.ts`: GET 상세 / POST 및 경로
- `apps/api/src/modules/recruitments/recruitments.service.ts`: content / 상세 / 메모리 생성
- `apps/api/src/modules/recruitments/create-recruitment.dto.ts`: POST body 모양과 문서 설명
- `apps/api/package.json`, `package-lock.json`: Swagger 의존성
- `apps/api/test/recruitments.e2e.mjs`: 실제 HTTP 회귀 테스트
- `docs/postman/campus-crew-session-13.postman_collection.json`: Postman 5단계 시나리오
- `docs/superpowers/plans/2026-09-13-campus-crew-session-13-rest-swagger-postman.md`: 사전 구현 계획
- `docs/session-13-checkpoint.md`: 실행 / 학생 설명 / 검증 기록

2026-09-13 검증 결과:

| 검사                              | 결과                                                            |
| --------------------------------- | --------------------------------------------------------------- |
| format:check                      | 통과                                                            |
| lint                              | API / Web 모두 통과                                             |
| build                             | NestJS / Next.js 모두 통과                                      |
| Node HTTP 테스트                  | 6개 통과, 실패 0개                                              |
| Postman collection (Newman 6.2.2) | 요청 5개, assertion 13개 통과                                   |
| Swagger 브라우저 확인             | /docs 로드, 세 API 및 POST body 예시 표시                       |
| Swagger Try it out                | POST 201 + id 5 / OPEN, GET 200 + 생성 항목 확인                |
| 새 서버 프로세스의 메모리 초기화  | 초기 3개 / 첫 생성 id 4 확인                                    |
| 기존 코드 보존                    | Web, AppModule, RecruitmentsModule, 루트 package.json 변경 없음 |
| 기존 12차시 작업 공간             | f477d60 유지, 미커밋 변경 없음                                  |
| 읽기 전용 코드 검토               | 진행을 막는 문제 없음                                           |

개발 서버는 `PORT=4013`으로 `npm run dev:api`를 실행했다. Newman에서 200 → 200 → 404 → 201 → 200 순서와 목록 증가를 확인했고, Swagger에서도 실제 GET/POST를 실행했다. 검증용 서버는 종료했다. 사용자는 `npm run dev:api`로 기본 포트 4000에서 다시 실행하면 된다.

Newman은 검증용 임시 npm 캐시에서 실행했으며 프로젝트 의존성에는 추가하지 않았다. Postman 데스크톱 앱의 수동 클릭 대신, 동일한 collection의 요청과 스크립트를 Newman으로 실행했다. 임시 포트를 사용할 때의 CLI 인자는 `--env-var "baseUrl=http://localhost:4013"`이다.

구현 전에는 기존 루트 응답 테스트 1개만 통과하고 미구현 API / Swagger 테스트 5개가 실패함을 확인했다. 구현 후에는 모두 통과했다. 설치 시 오프라인 캐시 누락은 네트워크 설치로 해결했고, 테스트의 Node URL import 누락은 수정했다. Windows npm 실행을 통한 Newman 옵션 전달 문제는 설치된 Newman 실행 파일을 직접 호출하여 해결했다.

작업 브랜치: `feat/session-13-rest-swagger-postman`. 기준 커밋: `f477d60`. 기존 이력을 수정하거나 이전 worktree에 덮어쓰지 않았다.
