# 19차시 — 모집글 작성 POST와 useMutation

## 결과와 보존 범위

기준 커밋 `6f658ca`에서 별도 worktree와 `feat/session-19-create-mutation` 브랜치를 만들었습니다. 4~18차시 commit/branch/worktree와 기존 DB seed는 그대로 유지합니다. 기존 커밋 수정 및 파괴적 Git 명령은 사용하지 않습니다.

기존 `/recruitments/new`, `RecruitmentForm`, RHF `handleSubmit`, Zod schema를 재사용합니다. `schema.ts`, 작성 page, 기존 목록·상세 조회, backend, Prisma, migration, seed, package-lock은 변경하지 않았습니다.

## 변경 파일

| 파일                                                      | 역할                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/web/src/features/recruitments/api.ts`               | createRecruitment, 단일 DEMO_AUTHOR_ID, payload 조립, POST 오류 처리 |
| `apps/web/src/features/recruitments/types.ts`             | CreateRecruitmentInput / CreateRecruitmentRequest                    |
| `apps/web/src/features/recruitments/recruitment-form.tsx` | mutation, 캐시 무효화·이동, pending 버튼, 서버 오류                  |
| `apps/web/test/create-recruitment.test.mjs`               | 실제 HTTP 서버를 이용한 생성 요청 경계 테스트 5개                    |
| `README.md`, 이 문서, 19차시 계획                         | 실행·교육·검증 기록                                                  |

## 실행

새 checkout은 `npm ci`를 실행합니다. 루트 `.env`가 없다면 `.env.example`을 복사하고 16차시 DB migration/seed를 준비합니다. 기존 환경 파일과 데이터를 덮어쓰지 않습니다.

```bash
# 기존 DB를 운영하는 worktree에서, DB가 중지되어 있을 때
docker compose up -d

# 터미널 1
npm run dev:api
# 터미널 2
npm run dev:web
```

Next는 3000, Nest는 4000입니다. 기존 5432 PostgreSQL이 실행 중이면 그대로 재사용합니다. 각 worktree에서 Compose를 중복 실행하면 다른 project/volume이 생기거나 포트가 충돌할 수 있습니다.

## 입력 → 요청 → DB → 목록

```text
제목 / category / content
  → RHF handleSubmit
  → Zod 검증 통과
  → mutation.mutate(form values)
  → mutationFn: createRecruitment
  → { ...input, authorId: DEMO_AUTHOR_ID }
  → POST /api/recruitments (Next rewrite → Nest → Prisma → PostgreSQL)
  → 201 Recruitment JSON
  → onSuccess
  → await invalidateQueries({ queryKey: ['recruitments'] })
  → router.push('/recruitments')
  → 목록 GET → 최신 카드 표시
```

`useQuery`는 읽기(Read), `useMutation`은 생성·수정·삭제 같은 변경 작업에 사용합니다. `mutationFn`은 요청을 수행하는 Promise 함수이며, `isPending`은 실행 중인 mutation을 나타냅니다. 이번 폼은 `formState.isSubmitting`과 중복 상태를 만들지 않고 `mutation.isPending` 하나로 버튼을 제어합니다. 요청 중에는 “등록 중...”과 disabled를 표시하며 submit 함수에도 pending guard가 있습니다.

```ts
const mutation = useMutation({
  mutationFn: createRecruitment,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ['recruitments'] });
    router.push('/recruitments');
  },
});
```

onSuccess의 Promise를 기다리는 동안도 pending입니다. 요청 성공을 확인한 뒤에만 이동합니다. 상세 cache를 직접 수정하거나 optimistic update를 하지 않습니다.

## Form values와 API payload

`CreateRecruitmentInput`은 제목·category·내용입니다. `CreateRecruitmentRequest`는 여기에 `authorId: number`가 추가됩니다. 입력 화면의 값과 서버가 필요로 하는 요청 데이터는 동일한 개념이 아닙니다.

`api.ts` 한 곳에 `const DEMO_AUTHOR_ID = 1`을 두었습니다. 저장소 seed의 teacher 이메일을 확인하고, 실제 DB `users` 조회에서도 `teacher@example.com → id 1`임을 확인했습니다. 학생 폼에 작성자 입력을 추가하지 않습니다. 다른 학습 DB에서는 아래 SQL로 실제 ID를 확인하고 이 상수 한 곳만 맞춥니다.

```sql
SELECT id, name, email FROM users
WHERE email = 'teacher@example.com';
```

주석에 “21~23차시 auth 이후 현재 로그인 사용자 id로 교체”를 명시했습니다. 현재는 교육용 임시 처리이며, auth 단계에서는 서버가 인증된 현재 사용자를 기준으로 작성자를 결정하는 구조로 이어갑니다.

응답 타입은 기존 `Recruitment`를 재사용합니다. Nest의 실제 응답에는 `id/title/content/category/status/authorId/author/createdAt/updatedAt`이 포함됩니다. TypeScript 반환 타입은 컴파일 시 계약이며 별도 런타임 응답 schema를 추가하지 않았습니다.

## 두 종류의 오류

- **입력 오류:** 요청 전에 Zod가 검사합니다. 기존 제목·카테고리·내용 아래 메시지로 표시하고 POST는 보내지 않습니다.
- **서버/통신 오류:** 요청 함수가 reject하면 mutation.error가 됩니다. 폼 아래 `role="alert"`에 한국어 오류를 표시합니다. 입력값을 초기화하지 않으므로 서버가 복구되면 다시 등록할 수 있습니다.

HTTP 400/500뿐 아니라 연결 실패, 잘못된 JSON도 성공으로 취급하지 않습니다. HTML proxy 오류는 `response.ok` 검사에서 먼저 처리합니다. alert 팝업이나 toast에 의존하지 않습니다. 새로운 mutation이 시작되면 이전 mutation 오류 상태는 초기화됩니다.

## 캐시와 DB의 차이

POST가 서버 DB를 변경합니다. Query cache는 브라우저 메모리에 있는 조회 결과이며 DB 자체가 아닙니다. DB에 저장됐다고 기존 목록 cache가 저절로 바뀌지는 않습니다.

`invalidateQueries({ queryKey: ['recruitments'] })`는 같은 prefix의 query를 오래된 상태로 표시합니다. 활성 query는 재조회하며, 비활성 목록은 목록으로 이동해 다시 활성화될 때 재조회합니다. 18차시의 30초 staleTime 안에 저장된 목록도 무효화 대상입니다. 상세 `['recruitments', id]`도 같은 prefix이므로 함께 stale 처리됩니다.

## 실제 검증 결과

- 기존 Docker `campus-crew-session-15-postgres-1`, PostgreSQL 17 healthy 상태 재사용. teacher=1, student1=2, student2=3 확인.
- 이 worktree에서 API와 Next production build를 실제 실행. 정상 상세 페이지 console error/warn 없음.
- 빈 폼: 제목 최소 2자, 카테고리 필수, 내용 최소 10자 메시지 표시. 해당 시점 POST 없음.
- 정상 폼: 제목/category/content 입력 → “등록 중...” disabled 확인. 검증 전용 외부 preload로 실제 Nest 요청 처리를 8초 지연하고 pending 동안 Enter 재제출. POST는 한 번, DB row도 하나 생성.
- 브라우저 조작에 대응하는 서버 로그: `POST /api/recruitments → 201`, `x-forwarded-host: localhost:3000`, 이후 목록 GET 200 확인.
- 이전에 방문한 목록으로 자동 이동해 새 카드 표시. 카드 클릭으로 `GET /api/recruitments/32 → 200`, 제목·본문·teacher 확인.
- SQL에서 row `32`, 제목 “19차시 브라우저 검증 - React 스터디”, STUDY/OPEN, authorId=1 확인.
- 이 검증에서 시작한 Nest만 중지하고 정상 폼 제출: “모집글을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.” 표시, 입력값 유지, 버튼 다시 활성화.
- Nest 재시작 후 같은 입력으로 재제출: row `33` “19차시 오류 복구 검증” 생성, 목록 표시. 이전 row 32 상세 새로고침에도 데이터 유지.
- 브라우저 검증용 두 row(32, 33)는 수업에서 다시 확인할 수 있도록 DB에 남깁니다. 기존 seed 6개는 보존합니다.
- 기존 웹 GET 테스트 5개 통과. 새 POST 테스트는 구현 전 함수 부재로 실패 확인 후 구현하여 전체 10/10 통과.
- 기존 실제 API/DB e2e 11/11 통과. 이 테스트 자체의 임시 row cleanup 후 기존 데이터 보존 검사 포함.
- 루트 `npm run format:check`, `npm run lint`, `npm run build` 통과.
- 독립 코드 리뷰에서 수정이 필요한 정확성·회귀 문제 없음.

사용 가능한 브라우저 도구는 DevTools Network 패널을 직접 제공하지 않아 패널 자체를 열어 확인하지는 못했습니다. 실제 브라우저 폼 조작, same-origin 요청의 서버 method/status 로그, SQL row를 함께 확인했습니다. 검증 전용 지연·로그 코드는 저장소의 제품 코드에 포함하지 않았습니다.

## 학생 확인 순서

1. Docker PostgreSQL, Nest, Next를 실행합니다.
2. `/recruitments/new`에서 빈 값 제출과 필드별 오류를 확인합니다.
3. DevTools → Network → Fetch/XHR를 열고 Preserve log를 켭니다.
4. 정상 제목/category/content를 입력하고 등록합니다. 빠른 요청은 pending 표시가 짧을 수 있습니다.
5. `POST http://localhost:3000/api/recruitments`, status 201, payload의 authorId, response의 id를 확인합니다.
6. 목록 자동 이동과 후속 GET, 새 카드와 상세 GET을 확인합니다.
7. DBeaver에서 `SELECT * FROM recruitments WHERE id = 32;`처럼 방금 응답받은 ID로 조회합니다.
8. Nest를 재시작하고 상세를 새로고침해 영속성을 확인합니다.
9. Nest 중지 상태에서 다시 작성해 서버 오류 UI를 확인한 뒤 Nest를 복구합니다.

## 20차시로 이어가기

다음에는 같은 mutation 패턴을 edit form PATCH와 DELETE UI에 적용합니다. 수정·삭제 성공 후 관련 목록/상세 cache 무효화와 이동 위치를 설명합니다. 이번 차시에는 해당 UI, 인증/JWT, 소유자 권한, 지원, 검색/필터/페이지네이션을 추가하지 않았습니다.
