# 18차시 — TanStack Query로 실제 모집글 조회하기

## 이번 차시 결과

17차시의 PostgreSQL 모집글을 Next 목록·상세 화면에 연결했습니다. 기존 Header, Container, 카드, 상세 article, Spinner, ErrorMessage, EmptyState를 재사용합니다. `?mode=loading|error|empty` 수동 switch를 제거하고 실제 요청 상태를 표시합니다.

기준 커밋은 `68cb893`, 작업 브랜치는 `feat/session-18-frontend-query-integration`입니다. 이전 차시 작업 공간과 커밋은 수정하지 않았습니다. `apps/api`, Prisma schema/migration/seed, compose, 작성 폼과 검증 schema도 그대로 유지했습니다. 기존 mock fixture는 과거 차시 비교를 위해 보관하되 목록·상세에서 import하지 않습니다.

## 실행

새 checkout에서는 `npm ci`를 실행합니다. DB 설정이 없다면 루트 `.env.example`을 `.env`로 최초 한 번 복사합니다. 기존 `.env`와 DB는 덮어쓰지 않습니다.

```bash
# DB가 아직 실행 중이지 않을 때, 기존 DB를 운영하는 저장소에서 실행
docker compose up -d

# 최초 DB라면 16차시 안내에 따라 migration/seed 준비
# 터미널 1
npm run dev:api
# 터미널 2
npm run dev:web
```

Next는 3000, Nest는 4000입니다. `/recruitments`에서 시작합니다. Git worktree마다 Compose 기본 project 이름이 달라질 수 있습니다. 이미 5432에서 기존 수업 DB가 실행 중이면 그 DB를 재사용하고 두 번째 컨테이너를 띄우지 않습니다.

웹 `.env.local`에 API 주소를 넣을 필요가 없습니다. 기존 `NEXT_PUBLIC_API_BASE_URL`은 이번 client가 읽지 않습니다.

## 요청 흐름과 파일

```text
RootLayout (Server Component)
  └─ Providers (Client Component, useState(createQueryClient))
      └─ QueryClientProvider
          └─ 기존 Header / main / Container / 페이지

useQuery → features/recruitments/api.ts → lib/api-client.ts
  → fetch('/api/recruitments[/id]')
  → Next :3000 rewrite → Nest :4000 → Prisma → PostgreSQL
  → JSON → Query 캐시 → 목록 카드 / 상세 화면
```

| 파일                                                      | 역할                                                         |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `apps/web/src/lib/query-client.ts`                        | QueryClient 생성, staleTime 30초, retry false                |
| `apps/web/src/providers.tsx`                              | useState로 client 유지, QueryClientProvider 제공             |
| `apps/web/src/app/layout.tsx`                             | 기존 공통 레이아웃을 Providers로 감싸기                      |
| `apps/web/next.config.ts`                                 | `/api/:path*`를 `http://localhost:4000/api/:path*`로 rewrite |
| `apps/web/src/lib/api-client.ts`                          | fetch, res.ok 검사, JSON 반환, Error throw                   |
| `apps/web/src/features/recruitments/api.ts`               | getRecruitments / getRecruitment                             |
| `apps/web/src/features/recruitments/types.ts`             | 실제 응답 타입과 한글 category 표시 이름                     |
| `apps/web/src/app/recruitments/page.tsx`                  | 목록 useQuery와 상태별 UI                                    |
| `apps/web/src/app/recruitments/[id]/page.tsx`             | dynamic id, 상세 useQuery와 오류 처리                        |
| `apps/web/src/features/recruitments/recruitment-card.tsx` | 실제 enum 표시와 ISO 날짜 표시, 상세 Link 유지               |
| `apps/web/src/features/recruitments/mock-data.ts`         | 기존 fixture를 독립 타입으로 보관                            |
| `apps/web/test/api-client.test.mjs`                       | 실제 HTTP 서버를 이용한 fetch 경계 테스트 5개                |
| `apps/web/package.json`, `package-lock.json`              | TanStack Query 5.103.1 고정, 웹 test script                  |
| `apps/web/.env.example`, `apps/web/src/lib/README.md`     | same-origin 설정 설명                                        |
| `README.md`, 이 문서, 18차시 계획                         | 실행·학습·검증 기록                                          |

API client는 실패 응답의 body가 HTML이어도 JSON을 먼저 파싱하지 않습니다. `res.ok`가 false면 Error를 던지므로 proxy 장애도 ErrorMessage에 도달합니다. 404는 “모집글을 찾을 수 없습니다.”로 표시합니다. 네트워크 실패와 잘못된 JSON 역시 rejected Promise로 전달됩니다.

TypeScript의 반환 타입은 컴파일 시 계약입니다. 이번 차시에서는 런타임 schema 검증 계층을 추가하지 않았습니다. Nest의 실제 응답 계약을 기준으로 사용합니다.

```ts
type Recruitment = {
  id: number;
  title: string;
  content: string;
  category: 'STUDY' | 'PROJECT' | 'CONTEST';
  status: 'OPEN' | 'CLOSED';
  authorId: number;
  author: { id: number; name: string };
  createdAt: string;
  updatedAt: string;
};
```

API 날짜는 ISO 문자열이며, 화면에는 UTC 날짜 부분 `YYYY-MM-DD`를 표시하고 `<time dateTime>`에는 원본 전체 값을 둡니다. category는 스터디/프로젝트/공모전으로 표시합니다.

## Query를 읽는 방법

| 화면 | queryKey               | queryFn                    | GET                     |
| ---- | ---------------------- | -------------------------- | ----------------------- |
| 목록 | `['recruitments']`     | `getRecruitments`          | `/api/recruitments`     |
| 상세 | `['recruitments', id]` | `() => getRecruitment(id)` | `/api/recruitments/:id` |

상세 id는 `useParams<{ id: string }>()`에서 읽습니다. 따라서 `/recruitments/1`의 키는 `['recruitments', '1']`입니다. 목록은 배열이고 상세는 한 객체이므로 같은 캐시 칸에 넣으면 안 됩니다. 상세끼리도 id가 달라지면 다른 데이터입니다. 문자열 `'1'`과 숫자 `1`은 다른 키이므로 다음 차시에도 타입을 일관되게 유지합니다.

`queryFn`은 Promise를 반환하는 요청 함수입니다. 페이지는 fetch의 HTTP 검사나 JSON 파싱을 직접 알 필요 없이, 함수와 queryKey만 지정합니다. 별도 custom hook 계층은 추가하지 않았습니다.

| Query 결과                     | 화면                                |
| ------------------------------ | ----------------------------------- |
| `isPending`                    | 기존 Spinner                        |
| `isError`                      | 기존 ErrorMessage와 refetch 버튼    |
| 성공, 목록 `data.length === 0` | 기존 EmptyState와 작성 페이지 링크  |
| 성공, 목록 데이터 존재         | RecruitmentCard map                 |
| 성공, 상세 데이터 존재         | 작성자·날짜·본문·카테고리·상태 표시 |

`isPending`은 아직 성공한 데이터가 없는 상태입니다. `isLoading`은 pending이면서 실제 fetch가 진행 중일 때입니다. 이번 코드는 활성화된 단순 조회이므로 `isPending` 분기를 사용합니다. 이미 데이터가 있는 재조회에는 보통 `isFetching`만 true가 되며, 실패 시 ErrorMessage를 표시합니다. “다시 시도”는 `refetch()`를 호출하고 요청 중에는 버튼을 비활성화합니다.

## 서버 상태와 local state, 캐시

서버 상태는 DB에 저장된 모집글처럼 다른 사용자나 API 요청으로 바뀔 수 있는 데이터입니다. React local state는 현재 열린 메뉴나 아직 제출하지 않은 입력처럼 현재 화면이 소유한 상태입니다. 폼 입력을 Query 캐시에 넣거나, 서버 목록을 별도 useState에 복사하지 않습니다.

QueryClient는 queryKey별 데이터·요청 상태를 관리합니다. Provider는 그 client를 하위 컴포넌트에 제공합니다. 렌더링 때마다 `new QueryClient()`를 만들면 캐시가 사라지므로 Provider에서 `useState(createQueryClient)`로 유지합니다.

이번 설정은 `staleTime: 30_000`입니다. 30초 이내에는 같은 key의 데이터를 최신으로 간주해 재사용합니다. 30초가 지났다는 이유만으로 즉시 자동 요청하지는 않습니다. 오래된 데이터의 컴포넌트가 다시 나타나거나 창이 다시 활성화되는 등의 계기에 재조회합니다. 비활성 캐시는 기본적으로 약 5분 뒤 정리됩니다. 전체 페이지 새로고침은 메모리 캐시도 새로 시작합니다. DB 변경을 서버가 실시간으로 밀어주는 구조는 아닙니다.

수업에서는 오류 상태를 바로 관찰하도록 `retry: false`를 설정했습니다. 네트워크 장애 후 “다시 시도”로 명시적으로 재요청할 수 있습니다. HTTP fetch에는 `cache: 'no-store'`를 사용하여 브라우저 HTTP 캐시와 Query의 메모리 캐시를 혼동하지 않도록 했습니다.

## 실제 검증 기록

- Docker: 기존 `campus-crew-session-15-postgres-1`, PostgreSQL 17, healthy, 5432 포트 확인. 기존 컨테이너/volume 재사용.
- Nest: 이 worktree의 `npm run start:api` 및 `npm run dev:api`로 4000 실행 확인. Next: `npm run dev:web`로 3000 실행.
- 목록: 실제 DB seed 6개 표시. category 세 종류와 OPEN/CLOSED, author 이름 확인.
- 상세: 카드 클릭으로 id 1, id 5 이동; 각각 다른 제목·본문 표시, 직접 새로고침 성공.
- same-origin: `/api/recruitments`와 `/api/recruitments/1`이 Next 3000에서 200 JSON 반환. 브라우저 조작 중 임시 서버 요청 로그에서도 두 GET과 `x-forwarded-host: localhost:3000`을 확인.
- 404: `/recruitments/2147483647`에서 친화적인 오류와 목록 링크, 다시 시도 버튼 표시.
- 서버 장애: 이 작업에서 시작한 Nest만 중지하여 목록 ErrorMessage 확인. 재시작 후 버튼 클릭으로 실제 seed 목록 복구.
- 로딩/빈 목록: DB 데이터를 삭제하지 않고, Nest를 잠시 내린 같은 포트에 검증 전용 HTTP 서버를 띄워 6초 후 `[]` 응답. Spinner → EmptyState와 작성 링크를 브라우저에서 확인. 검증 서버 종료 후 실제 Nest로 복원.
- DB 변경: 직접 SQL로 id 1의 제목에 임시 표식을 추가. 상세 새로고침과 목록 재조회에서 변경 확인. 곧바로 자동 복원했으며 모든 모집글 row와 timestamp가 원본 snapshot과 정확히 같음을 검사.
- 콘솔: 정상 목록·상세 조회와 복원 후 콘솔 error/warn 없음. 의도적인 장애/404의 HTTP 실패는 오류 시나리오에 해당.
- 웹 HTTP 경계 테스트 5/5 통과: 성공 JSON, 404, HTML 500, 네트워크 중단, 잘못된 JSON.
- 기존 API 실제 DB e2e 11/11 통과. 테스트가 생성한 행은 기존 테스트의 cleanup으로 제거되며 기존 seed는 유지.
- 루트 `npm run format:check`, `npm run lint`, `npm run build` 모두 통과. 웹 테스트 5개, 기존 API 테스트 11개 모두 통과.
- 독립 코드 리뷰: 수정이 필요한 정확성/회귀 문제 없음.
- 검증용 Next/Nest 및 임시 endpoint 프로세스 종료. 기존 PostgreSQL 컨테이너는 실행 상태로 유지. 위 실행 명령으로 다시 열 수 있습니다.

검증 도구는 브라우저 DevTools의 Network 패널을 직접 제공하지 않아 그 패널을 클릭해 확인하지는 않았습니다. 대신 same-origin HTTP 결과와 브라우저 조작에 대응하는 서버 요청 로그로 검증했습니다. 수업에서는 DevTools → Network → Fetch/XHR에서 `recruitments`를 필터링하고 Request URL이 `http://localhost:3000/api/...`인지 직접 확인하면 됩니다.

## 19차시로 이어가기

다음 차시에는 기존 RecruitmentForm의 submit을 `useMutation`과 POST 함수에 연결합니다. 성공 시 `queryClient.invalidateQueries({ queryKey: ['recruitments'] })`로 목록을 오래된 상태로 표시하여 재조회하고, 반환된 id로 상세 이동할 수 있습니다. 상세 key도 같은 prefix를 사용하므로 prefix invalidation 범위를 함께 설명합니다.

그때 작성자 선택과 `authorId`를 어떻게 전달할지 명확히 정합니다. 이번 차시에는 기존 form submit 동작을 유지하고 POST/PATCH/DELETE mutation, 인증, 지원, 검색/페이지네이션, SSR prefetch/hydration을 구현하지 않았습니다.

## 참고

- [TanStack Query Quick Start](https://tanstack.com/query/latest/docs/framework/react/quick-start)
- [TanStack Query Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [Next.js rewrites](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites)
