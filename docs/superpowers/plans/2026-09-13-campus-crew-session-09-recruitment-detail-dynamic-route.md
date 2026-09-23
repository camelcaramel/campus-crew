# Campus Crew 9차시 모집글 상세 Dynamic Route 구현 계획

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task in this session.

**Goal:** 목록 제목에서 상세 URL로 이동하고 동일한 Mock 배열에서 선택한 모집글을 표시한다.

**Architecture:** 기존 RootLayout의 Header/Container를 상속한다. 목록과 상세는 mock-data.ts를 직접 import하고, async 상세 page에서 await params → Number(id) → find → notFound 순서로 데이터를 선택한다.

**Tech Stack:** 기존 Next.js 16.3.4 App Router, React 19.3.0, TypeScript, Tailwind CSS 4, npm workspaces.

**Spec:** 사용자가 이 작업에 지정한 9차시 범위 및 디자인 기준. 기존 8차시 기준 커밋은 283854c.

## 공통 제약

- 4~8차시 브랜치와 파일을 보존하고 새 feat/session-09-recruitment-detail-route worktree에서만 작업한다.
- 기존 types.ts, Mock 객체 4개, Header/Container, 홈, API, package/lockfile 및 5차시 설정을 유지한다.
- API 호출, TanStack Query, DB, auth, 신청, owner 분기, 수정/삭제 기능을 추가하지 않는다.
- 데이터 접근 함수나 별도 상태 관리 등 불필요한 추상화를 추가하지 않는다.
- 파괴적 Git 명령과 기존 커밋 수정은 사용하지 않는다.

## Task 1: 공통 데이터 및 상세 route

**Files:**

- 생성: apps/web/src/features/recruitments/mock-data.ts
- 수정: apps/web/src/app/recruitments/page.tsx
- 수정: apps/web/src/features/recruitments/recruitment-card.tsx
- 생성: apps/web/src/app/recruitments/[id]/page.tsx

**Interfaces:** mock-data.ts는 기존 Recruitment[]인 mockRecruitments를 export한다. 상세 params 타입은 Promise<{ id: string }>이다.

- [x] 기존 캐시에서 npm ci --offline --no-audit --no-fund로 설치하고 npm run check로 변경 전 기준을 확인한다.
- [x] 기존 목록 페이지의 Mock 배열을 값 변경 없이 mock-data.ts로 옮긴다.

원본 page.tsx에서 주석부터 배열의 닫는 `];`까지 그대로 추출한다. 새 파일 첫 줄에 `import type { Recruitment } from './types';`를 두고, `const mockRecruitments` 선언에만 `export`를 붙인다. 목록의 타입 import와 배열 선언을 제거하고 `import { mockRecruitments } from '@/features/recruitments/mock-data';`로 바꾼다.

- [x] 목록에서는 데이터 import와 기존 map/key 렌더링을 사용한다.
- [x] 카드 h2 안의 제목을 다음 Link로 감싼다. hover underline과 기존 전역 focus-visible 표시를 사용한다.

```tsx
<Link href={`/recruitments/${recruitment.id}`} className="hover:underline">
  {recruitment.title}
</Link>
```

- [x] async 상세 페이지에서 다음 순서로 데이터를 선택한다.

```tsx
const { id } = await params;
const recruitmentId = Number(id);
const recruitment = mockRecruitments.find((item) => item.id === recruitmentId);
if (!recruitment) {
  notFound();
}
```

- [x] 상세 section의 pt-4와 기존 main py-8을 합쳐 상단 간격 48px을 만든다. 목록 복귀 Link, max-w-3xl article, rounded-xl border, p-6 sm:p-8을 사용한다.
- [x] 검증에서 발견한 전역 h1/p 우선순위 충돌은 상세의 text-3xl!/sm:text-4xl!/text-neutral-900!로 한정해 보정한다. 기존 globals.css는 유지한다.
- [x] category/status badge, 큰 h1, author.name/time, border-t로 나눈 content를 표시한다. content는 whitespace-pre-wrap과 break-words, leading-8을 사용해 전체 내용을 보여준다.
- [x] 숫자로 변환할 수 없는 문자열은 NaN이 되어 find 결과가 없으므로 동일한 notFound()로 처리한다. 별도 not-found.tsx는 만들지 않는다.

## Task 2: 교육 설명과 검증 및 커밋

**Files:** 생성 docs/session-09-checkpoint.md. 기존 차시 문서는 보존한다.

- [x] checkpoint에 폴더→URL, Promise params, 문자열→숫자, find와 map의 차이, Link, 공통 데이터, notFound 흐름과 실행법을 기록한다.
- [x] 변경 파일만 Prettier로 정리하고 npm run format:check, npm run lint, npm run build, git diff --check를 실행한다.
- [x] 실제 서버에서 / 및 /recruitments는 200, /recruitments/1~4는 각각 일치하는 모든 필드, /recruitments/999 및 /recruitments/abc와 /recruitments/1abc는 404인지 확인한다.
- [x] 브라우저에서 제목 클릭→상세→목록 복귀, 마감 상태, 1440px/390px 가로 넘침과 48px 상단 여백, 12px radius를 확인한다. 이번 작은 화면 변경을 위한 테스트 프레임워크는 추가하지 않는다.
- [x] diff로 범위와 기존 데이터 보존을 검토하고 검증 결과를 checkpoint에 기록한다.
- [x] 기존 4~8차시 HEAD/status를 재확인하고 별도 커밋 feat: add recruitment detail route를 만든다.

## 공식 문서

- [Dynamic Segments](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
- [notFound](https://nextjs.org/docs/app/api-reference/functions/not-found)
