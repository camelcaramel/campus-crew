# 20차시 — 모집글 수정 PATCH · 삭제 DELETE

## 작업 기준과 변경 파일

19차시 `070d265`에서 `feat/session-20-edit-delete-mutations` 브랜치와 별도 `campus-crew-session-20` worktree를 만들었습니다. 4~19차시 이력과 기존 worktree, backend, Prisma schema/migration/seed 및 잠금 파일을 보존합니다.

| 파일                                                             | 역할                                           |
| ---------------------------------------------------------------- | ---------------------------------------------- |
| `apps/web/src/features/recruitments/api.ts`                      | updateRecruitment / deleteRecruitment          |
| `apps/web/src/features/recruitments/types.ts`                    | UpdateRecruitmentRequest                       |
| `apps/web/src/features/recruitments/recruitment-form.tsx`        | create/edit 공통 RHF + Zod 폼                  |
| `apps/web/src/features/recruitments/create-recruitment-form.tsx` | 기존 19차시 POST mutation과 성공 처리          |
| `apps/web/src/features/recruitments/queries.ts`                  | useRecruitmentQuery, 문자열 상세 query key     |
| `apps/web/src/app/recruitments/new/page.tsx`                     | create 컨테이너 사용                           |
| `apps/web/src/app/recruitments/[id]/edit/page.tsx`               | 상세 조회, 기본값, PATCH mutation              |
| `apps/web/src/app/recruitments/[id]/page.tsx`                    | 수정 이동, 삭제 confirm/DELETE mutation        |
| `apps/web/test/edit-delete-recruitment.test.mjs`                 | 실제 HTTP PATCH/DELETE 경계 테스트             |
| `apps/web/test/edit-form-state.test.mjs`                         | 오류/초기 재조회 시 편집 화면 분기 회귀 테스트 |
| `README.md`, 이 문서, 20차시 계획                                | 실행과 교육·검증 기록                          |

## 공통 폼 재사용

RecruitmentForm은 입력 필드, 기존 10차시 Zod schema, handleSubmit, pending 버튼과 오류 메시지를 담당합니다. 별도 복제 폼을 만들지 않았습니다.

```ts
type RecruitmentFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: RecruitmentFormValues;
  onSubmit: (values: RecruitmentFormValues) => void;
  isPending: boolean;
  errorMessage?: string;
  cancelHref?: string;
};
```

CreateRecruitmentForm은 기존 POST mutation을 그대로 맡습니다. edit page는 useRecruitmentQuery(id)와 PATCH mutation을 맡습니다. mode에 따라 등록/수정, 등록 중/수정 중 문구만 달라집니다. 서버 오류는 필드별 Zod 오류와 별도로 표시합니다.

수정 화면은 `useRecruitmentQuery(id, 'always')`로 진입할 때 최신 GET을 수행합니다. 첫 재조회가 끝나기 전에는 Spinner를 표시하여 오래된 cache나 빈 폼으로 편집을 시작하지 않습니다. 데이터 준비 후 `key={id}`와 title/content/category defaultValues로 RHF 폼을 처음 mount합니다.

RHF defaultValues는 최초 값을 기억합니다. 따라서 이미 열린 폼에서 GET 응답마다 reset하지 않습니다. 성공한 background refetch가 사용자의 입력을 덮어쓰지 않으며, 일시적인 background GET 실패에도 기존 폼을 유지합니다. 서버가 404를 반환하면 편집 폼 대신 없는 모집글 안내를 표시합니다. 다른 id로 이동하면 key가 바뀌어 해당 모집글로 초기화합니다.

## PATCH와 DELETE

`UpdateRecruitmentRequest = Partial<CreateRecruitmentInput>`입니다. API 함수는 일부 필드만 전달할 수 있고, 생략한 필드는 backend가 유지합니다. 이번 편집 폼은 현재 title/content/category 세 값을 제출하며 authorId와 status는 변경하지 않습니다. 폼 전체 값을 보낸다고 PATCH가 전체 리소스를 교체하는 PUT이 되는 것은 아닙니다.

```ts
updateRecruitment(id: number, input: UpdateRecruitmentRequest): Promise<Recruitment>
deleteRecruitment(id: number): Promise<void>
```

PATCH는 JSON request와 200 Recruitment JSON response를 사용합니다. DELETE는 Nest의 실제 204 No Content에 맞춰 `response.ok`만 검사하고 `response.json()`을 호출하지 않습니다. HTTP 오류와 연결 실패는 한국어 Error로 reject하며, PATCH의 잘못된 성공 JSON도 실패로 처리합니다.

## Mutation과 query cache

| 동작   | 성공 처리                                                                           | 이동           |
| ------ | ----------------------------------------------------------------------------------- | -------------- |
| create | 기존 `invalidateQueries({ queryKey: ['recruitments'] })`                            | 목록 push      |
| update | `['recruitments']`, `['recruitments', id]` 각각 exact invalidate, Promise.all await | 해당 상세 push |
| delete | 목록 exact invalidate, 상세 exact invalidate에 `refetchType: 'none'`                | 목록 replace   |

기존 상세 query key의 id는 route에서 읽은 **문자열**입니다. API 인수의 숫자 ID와 혼동하여 invalidate 키에 숫자를 넣지 않습니다. 예를 들어 상세 38의 키는 `['recruitments', '38']`입니다.

PATCH/DELETE가 DB를 변경합니다. invalidateQueries는 브라우저 query cache를 오래된 상태로 표시하는 작업입니다. 수정 성공 시 활성 상세는 재조회하며, 비활성 목록은 다시 화면에 표시될 때 재조회합니다. DELETE 직후 활성 상세를 즉시 GET하여 404 화면이 잠깐 보이는 것을 피하고, 다시 방문하면 stale 상세를 GET하여 404를 확인합니다. optimistic update와 직접 cache 데이터 조작은 사용하지 않습니다.

onSuccess에서 invalidate의 Promise를 기다리므로 해당 처리 동안도 mutation pending입니다. 제출 버튼 disabled와 submit guard로 중복 제출을 막습니다. 삭제 중에는 상세의 수정/삭제 버튼 모두 비활성화합니다. 실패 시 화면을 이동하지 않고 오류와 재시도 가능한 버튼을 표시합니다.

## Confirm과 권한

상세 페이지에서 삭제 버튼을 누르면 ‘정말 삭제할까요?’와 취소/삭제 확인 버튼이 나타납니다. 취소는 확인 영역만 닫고 요청을 보내지 않습니다. 삭제 확인을 눌러야 mutation.mutate를 호출합니다. 확인 상태와 pending guard를 함께 검사합니다. 이 최소 confirm은 사용자의 실수를 줄이는 UX이고 authorization이 아닙니다.

아직 모든 학습자가 수정/삭제 버튼을 볼 수 있습니다. 프론트에서 버튼을 숨기는 것만으로 권한이 생기지 않습니다. 23차시에 backend가 인증된 사용자와 작성자를 비교해 권한을 검사해야 합니다. 현재 코드를 인증이 완료된 서비스로 해석하지 않습니다.

## 실행과 학생 검증

```bash
# 처음 checkout했다면
npm ci
# 기존 수업 DB가 중지된 경우, 그 DB를 관리하던 worktree에서 실행
docker compose up -d
# 각각 별도 터미널
npm run dev:api
npm run dev:web
```

Next는 3000, Nest는 4000, 기존 PostgreSQL은 5432입니다. 루트 .env와 기존 migration/seed를 사용합니다. 여러 worktree에서 별도 Compose DB를 중복 생성하거나 seed를 다시 실행하지 않습니다.

1. 검증용 모집글을 작성하고 상세에서 수정으로 이동합니다.
2. 제목·본문·카테고리 기본값을 확인합니다.
3. 제목을 바꾸고 제출합니다. Network에서 PATCH 200과 후속 GET을 확인합니다.
4. 상세/목록과 다시 들어간 edit에서 수정된 값이 보이는지 확인합니다.
5. API를 중단한 뒤 수정 제출 시 오류·입력값 유지·재시도 가능 상태를 확인합니다.
6. API를 복구하고 저장합니다. API를 재시작한 뒤에도 DB 값이 유지되는지 확인합니다.
7. 삭제 버튼을 누른 뒤 confirm을 취소합니다. DELETE가 없어야 합니다.
8. 다시 삭제하고 확인합니다. DELETE 204, 목록 이동, 카드 제거를 확인합니다.
9. 삭제한 id의 상세/edit에 다시 접근해 error UI를 확인합니다.
10. DBeaver 또는 psql에서 아래 쿼리로 해당 row가 없어졌는지 확인합니다.

```sql
SELECT id, title, content, category FROM recruitments WHERE id = 38;
```

자신이 생성한 검증용 id로 바꿔서 실행합니다. 기존 수업 데이터는 삭제하지 않습니다.

## 검증 기록

- 웹 HTTP 테스트: 기존 10개 보존 + 신규 7개. 구현 전 신규 7개가 함수 부재로 실패했고 구현 후 통과했습니다.
- 편집 상태 회귀 테스트 3개 포함 웹 테스트 총 20개 통과. 이 상태 테스트는 실제 페이지·폼·schema를 렌더링하고 query lifecycle 상태를 제어하며, 브라우저 입력 동작은 아래 실사용 검증으로 확인합니다.
- 기존 API/DB e2e 11개 통과. 실제 PostgreSQL CRUD, API 재시작 영속성, 테스트 전후 기존 row 보존 검사를 포함합니다.
- 최종 전체 `npm run check` 통과: format:check, API/web lint, Prisma generate, API/web build. 수정 동적 라우트도 build 결과에 포함됐습니다.
- 독립 리뷰에서 발견한 두 입력 생명주기 문제를 보완했습니다: background GET 실패 시 draft 보존, edit 첫 진입 때 최신 GET 후 mount.
- 기존 Docker PostgreSQL 컨테이너와 기존 모집글 8개(id 1~6, 32, 33)를 보존했습니다.
- 실제 브라우저에서 빈 작성 폼 Zod 검증, 새 검증용 row 38 생성, 등록 pending과 목록 표시를 확인했습니다.
- row 38 수정 진입 시 title/content/PROJECT 기본값을 확인했습니다. 제목과 CONTEST로 변경해 PATCH 200, 상세/목록 갱신, SQL 저장 값을 확인했습니다.
- 검증용 외부 preload로 요청을 8초 지연해 pending을 관찰했습니다. PATCH pending 중 Enter로 다시 제출해도 실제 PATCH는 한 번이었습니다. 지연·로그 코드는 제품 저장소에 포함하지 않습니다.
- API 재시작 후 edit에 다시 진입해 변경한 DB 값을 확인했습니다.
- API 중단 후 PATCH 오류 메시지, 입력값 유지, 버튼 활성화를 확인했습니다. API 복구 후 재제출도 200으로 성공했습니다.
- 삭제 취소 후 서버 로그의 DELETE 요청은 0건이었습니다. API 중단 상태의 삭제 확인은 오류 메시지를 표시하고 재시도할 수 있었습니다.
- API 복구 후 삭제 확인: 수정/삭제/취소/삭제 확인 버튼 disabled, DELETE 204 한 번, 목록 GET 200, 자동 목록 이동과 카드 제거를 확인했습니다.
- 삭제한 row 38의 상세와 edit 모두 ‘모집글을 찾을 수 없습니다.’를 표시하고 빈 폼을 노출하지 않았습니다. SQL에서 row 38은 0개, 기존 8개는 그대로였습니다. API를 다시 시작한 후에도 GET 38은 404이고 목록은 8개였습니다.
- 브라우저 기본 window.confirm은 내장 브라우저 자동화가 응답하지 않는 문제가 재현되어, 최종 구현은 페이지 안의 최소 확인/취소 UI를 사용합니다. 모달 컴포넌트나 라이브러리는 추가하지 않았습니다. 이 최종 UX로 실제 브라우저 삭제 검증을 완료했습니다.
- Network 패널을 직접 열지는 않았습니다. 브라우저 UI 조작에 대응하는 서버 method/status 로그와 `x-forwarded-host: localhost:3000`, SQL을 함께 대조했습니다. DBeaver 대신 동일 DB에 psql로 조회했습니다.
- 정상 상세 페이지의 브라우저 console error/warn은 없었습니다. 오류 시나리오에서는 의도적으로 이 작업에서 시작한 API만 중지했습니다.

## 21차시 연결

다음은 signup endpoint와 password hash입니다. 사용자가 입력한 비밀번호를 평문으로 저장하지 않고 hash로 저장하며 응답에 비밀번호나 hash를 노출하지 않는 흐름을 구성합니다. 이후 로그인/인증을 거쳐 23차시에는 서버가 현재 사용자와 작성자를 확인하게 됩니다. 이번 차시의 useMutation → error/pending → 성공 처리 패턴을 signup 폼에도 재사용할 수 있습니다.
