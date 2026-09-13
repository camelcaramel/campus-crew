# 9차시 — Dynamic Route로 모집글 상세 보기

핵심 흐름은 **목록 Link → URL → params → Number → find → 상세 화면**입니다.

## 파일과 URL

```text
apps/web/src/app/recruitments/
├─ page.tsx        → /recruitments
└─ [id]/
   └─ page.tsx     → /recruitments/1, /recruitments/2, ...

apps/web/src/features/recruitments/
├─ types.ts
├─ mock-data.ts
└─ recruitment-card.tsx
```

대괄호가 있는 `[id]`는 URL에서 바뀌는 부분입니다. id마다 폴더나 페이지를 복사하지 않고, 상세 page.tsx 하나로 여러 모집글을 표시합니다.

## 목록에서 상세로

카드의 제목은 Next.js Link입니다.

```tsx
<Link href={`/recruitments/${recruitment.id}`} className="hover:underline">
  {recruitment.title}
</Link>
```

id가 2라면 href는 `/recruitments/2`입니다. 클릭하면 Next.js가 해당 상세 route로 이동합니다. 상세의 `모집글 목록으로` 링크로 목록에 돌아올 수 있습니다. 마감된 모집글도 내용을 읽을 수 있습니다.

## params에서 하나의 모집글 찾기

```tsx
type RecruitmentDetailPageProps = {
  params: Promise<{ id: string }>;
};
```

프로젝트의 Next.js 16에서 params는 Promise입니다. async page에서 `await params`로 값을 꺼냅니다. async라는 이유만으로 API를 호출하는 것은 아닙니다. 이번에는 파일에 정의된 배열만 사용합니다.

```tsx
const { id } = await params;
const recruitmentId = Number(id);
const recruitment = mockRecruitments.find((item) => item.id === recruitmentId);

if (!recruitment) {
  notFound();
}
```

1. `/recruitments/2`의 `id`는 문자열 `'2'`입니다.
2. Mock 객체의 id는 숫자 `2`입니다. `'2' === 2`는 false이므로 `Number(id)`로 숫자로 바꿉니다.
3. `find`는 조건이 맞는 첫 객체 하나를 반환합니다. 목록의 `map`은 모든 객체를 JSX로 바꾸지만, 상세의 `find`는 하나를 선택합니다.
4. 조건에 맞는 객체가 없으면 `undefined`입니다. `notFound()`가 상세 렌더링을 중단하고 Next.js 기본 404 화면으로 연결합니다.

`/recruitments/999`처럼 없는 숫자, `/recruitments/abc`처럼 숫자가 아닌 값 모두 같은 404로 처리합니다. `Number('abc')`는 NaN이고 어떤 Mock id와도 같지 않습니다. `Number('1abc')`도 NaN이어서 첫 모집글로 잘못 연결되지 않습니다. 여기서는 별도 id 검증 도구나 데이터 검색 함수를 만들지 않습니다.

## 동일한 데이터 재사용

목록과 상세 모두 다음 파일을 import합니다.

```tsx
import { mockRecruitments } from '@/features/recruitments/mock-data';
```

8차시 배열의 객체 4개를 그대로 옮겼으며 `types.ts`는 그대로 유지합니다. `mock-data.ts`에서 제목이나 내용을 한 번 바꾸면 목록과 상세가 모두 같은 값을 사용합니다. 8차시 문서의 페이지 내부 배열 설명은 해당 차시의 보존된 브랜치 기준입니다.

## 화면 구조

- 기존 RootLayout이 Header와 Container를 제공하므로 상세에 중복으로 넣지 않습니다.
- 기존 main의 py-8(32px)과 상세 section의 pt-4(16px)를 합쳐 헤더 아래 48px 간격을 둡니다.
- 상세 article은 최대 768px, 테두리 1px, 모서리 12px, 내부 여백 24px/32px입니다.
- category/status badge, 큰 제목, 작성자와 날짜, 구분선 아래 본문을 표시합니다.
- 목록에서는 두 줄로 요약하지만 상세에서는 content 전체를 표시합니다. whitespace-pre-wrap은 줄바꿈을 보존합니다.

기존 globals.css의 h1/p 규칙이 Tailwind 기본 우선순위보다 높습니다. 기존 화면을 보존하면서 상세만 지정한 크기·색상을 쓰도록 `text-3xl!`, `sm:text-4xl!`, `text-neutral-900!`를 사용합니다. Tailwind 4의 끝에 붙인 `!`는 해당 속성에 important를 적용합니다. 제목은 모바일 30px, 넓은 화면 36px이고 본문은 #111827입니다.

F04/F05의 공통 상세 콘텐츠만 다룹니다. API, DB, TanStack Query, 인증, 신청 폼, owner 분기, 수정/삭제는 후속 차시 범위입니다.

## 실행 및 검증

9차시 worktree 루트에서 실행합니다.

```bash
npm ci
npm run dev:web
```

`http://localhost:3000/recruitments`에서 제목을 클릭합니다. 상세 주소를 직접 입력하거나 새로고침해도 같은 모집글이 보여야 합니다.

```bash
npm run format:check
npm run lint
npm run build
git diff --check
```

lint와 build는 5차시 npm workspace 설정에 따라 web과 API를 모두 검사합니다.

## 학생 확인 과제

1. 첫 제목을 클릭하고 주소가 `/recruitments/1`로 바뀌는지 확인합니다.
2. `/recruitments/2`를 직접 입력하고 제목·본문·작성자가 모두 바뀌는지 확인합니다.
3. `/recruitments/3`에서 모집 마감 배지를 확인합니다.
4. `/recruitments/999`, `/recruitments/abc`, `/recruitments/1abc`의 404를 확인합니다.
5. mock-data.ts에서 한 제목을 수정하고 목록과 상세에 함께 반영되는지 확인합니다.
6. map과 find의 반환값, 문자열 id와 숫자 id의 차이를 설명합니다.

## 코드 보존

9차시는 8차시 커밋 `283854c`에서 `feat/session-09-recruitment-detail-route` 브랜치로 분기했습니다. 4~8차시의 브랜치와 worktree는 보존됩니다.

```bash
git diff feat/session-08-recruitment-list-mock..feat/session-09-recruitment-detail-route -- apps/web/src
```

worktree는 기존 Campus Crew 저장소의 Git 기록을 공유하므로 폴더를 임의로 이동하지 않습니다.

## 실제 검증 기록

실행일: 2026-09-13. Windows / Node.js 22.17.1 / npm 10.9.2.

| 검사          | 결과                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 의존성 설치   | `npm ci --offline --no-audit --no-fund`, 610개 설치, 종료 코드 0                                                       |
| 변경 전 기준  | `npm run check`의 format:check / lint / build 모두 통과                                                                |
| 최종 코드     | 스타일 보정 후 `npm run check` 재실행, format:check / web·API lint / web·API build 모두 통과, 종료 코드 0              |
| 빌드 route    | `/`, `/recruitments` 유지, `ƒ /recruitments/[id]` 생성                                                                 |
| HTTP          | 홈·목록·상세 1~4 모두 200. 각 상세 article에서 category, status 표시, title, author.name, createdAt, content 전체 일치 |
| 잘못된 id     | 999, abc, 1abc, 0, -1, 1.5 모두 HTTP 404                                                                               |
| 데이터 보존   | 8차시 커밋의 Mock 배열과 새 mock-data.ts 배열을 비교해 내용 동일 확인                                                  |
| 브라우저 이동 | 목록 첫 제목 클릭 → 상세 1 → 목록 복귀 → 마감된 상세 3 정상                                                            |
| 직접 접속     | 상세 2 직접 접속·새로고침 정상, abc는 Next.js 기본 404 화면 표시                                                       |
| 1440px 화면   | 상세 폭 768px, 내부 여백 32px, radius 12px, Header 1개, 상단 32+16=48px, 제목 36px                                     |
| 390px 화면    | 상세 폭 326px, 내부 여백 24px, 제목 30px, 본문 #111827, document 폭 390px으로 가로 넘침 없음                           |
| 콘솔          | 정상 목록/상세 이동에서 warning/error 없음                                                                             |
| 코드 리뷰     | 전역 CSS 우선순위 충돌 1건 보정 후 실제 computed style로 해결 확인. 기타 지적 없음                                     |
| 이전 차시     | 4~8차시 HEAD 8332381 / f6c4e44 / ceb4583 / 096900d / 283854c 유지, 각 worktree clean                                   |
| 변경 범위     | 코드 4개, 문서 2개. types.ts, Header/Container, 전역 CSS, API 및 package/lockfile·5차시 설정 유지                      |

검증 서버는 `node node_modules/next/dist/bin/next start apps/web --hostname 127.0.0.1 --port 3109`로 실행했습니다. 검증을 마친 뒤 서버와 임시 탭을 종료하고 viewport 설정을 복원했습니다. HTTP 및 데이터 비교에는 저장소 밖의 임시 검증 스크립트를 사용했으며 테스트 프레임워크/의존성은 추가하지 않았습니다.

설치 중 기존 ESLint 9 지원 종료 및 선택적 패키지 정리 EPERM 경고가 있었지만 설치와 전체 검사는 성공했습니다. 실행 프로세스에만 `npm_config_prefix`와 기존 npm 캐시 경로를 지정했습니다. 사용자 전역 Git ignore 읽기 권한 경고가 있었으며 저장소 status/diff 및 기존 차시 보존 확인은 정상 수행되었습니다.

## 공식 문서

- [Next.js Dynamic Segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
- [Next.js notFound](https://nextjs.org/docs/app/api-reference/functions/not-found)
