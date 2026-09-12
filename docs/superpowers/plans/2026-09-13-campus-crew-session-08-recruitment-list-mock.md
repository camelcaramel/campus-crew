# Campus Crew Session 08 Recruitment List Mock UI Implementation Plan

> 실행: superpowers:executing-plans에 따라 이 세션에서 순서대로 구현하고 검증한다.

**Goal:** 학생이 명시적인 타입, Mock 배열, map, props, key를 통해 데이터가 카드 UI가 되는 흐름을 이해한다.

**Architecture:** 기존 RootLayout의 Header와 Container를 재사용한다. page.tsx에 Mock 배열과 map을 함께 두고, RecruitmentCard는 객체 하나를 props로 받아 표시한다. 별도 List, Badge, service 계층을 만들지 않는다.

**Tech Stack:** 저장소의 Next.js App Router, React, TypeScript, Tailwind CSS, npm workspaces. 의존성을 추가하거나 버전을 변경하지 않는다.

**Spec:** 이 작업의 사용자 요청에 명시된 8차시 범위 및 고정 디자인 기준. F03은 제공된 제목/부제 및 카드 기준을 적용한다.

## 고정 조건

- 기준 커밋: 7차시 `096900d`. 4~7차시 브랜치, 커밋, 작업 폴더를 보존한다.
- 브랜치: `feat/session-08-recruitment-list-mock`, 별도 `outputs/campus-crew-session-08` worktree.
- 기존 Header, Container, layout.tsx, globals.css 및 5차시 설정을 수정하지 않는다.
- 본문 최대 폭 1120px. 카드 padding 24px, radius 12px, border 1px #E5E7EB.
- 제목 #111827, 보조 텍스트 #6B7280. OPEN은 green/모집 중, CLOSED는 gray/모집 마감으로 표시한다.
- 페이지 제목: 함께할 팀원을 찾아보세요
- 페이지 부제: 스터디와 프로젝트를 함께할 사람을 찾아보세요.
- 상세 링크는 9차시로 미룬다. 작성/검색/필터/페이지네이션 요소도 생략해 이번 학습 흐름에 집중한다.
- API, TanStack Query, auth, loading/error, shadcn/ui, 아이콘, 이미지, 애니메이션을 추가하지 않는다.
- any 금지. Mock 데이터는 페이지의 한 배열에 4개를 둔다.

## Task 1: 기준 상태와 환경 확인

- [x] 기존 브랜치/커밋과 clean 상태를 기록하고 새 worktree를 확인한다.
- [x] 기존 lockfile과 캐시를 이용해 `npm ci --offline --no-audit --no-fund`를 실행한다.
- [x] 코드 변경 전에 `npm run check`로 format:check, lint, build 기준 상태를 확인한다.

## Task 2: 데이터에서 카드까지 구현

**Create:** `apps/web/src/features/recruitments/types.ts`

```ts
export type Recruitment = {
  id: number;
  category: '스터디' | '프로젝트';
  status: 'OPEN' | 'CLOSED';
  title: string;
  content: string;
  author: { name: string };
  createdAt: string;
};
```

**Create:** `apps/web/src/features/recruitments/recruitment-card.tsx`

- [x] `RecruitmentCardProps = { recruitment: Recruitment }`를 선언하고 named export `RecruitmentCard`를 작성한다.
- [x] article 안에 category/status span, h2 제목, 두 줄 요약, author.name, time을 표시한다.
- [x] 카드에 `rounded-xl border border-neutral-200 p-6`, 제목에 `text-neutral-900`, 보조 텍스트에 `text-neutral-500`을 적용한다.
- [x] status를 `recruitment.status === 'OPEN'`으로 구분한다. green-50/green-700 또는 gray-100/gray-600 배경/글자와 한글 상태 텍스트를 함께 쓴다.
- [x] 날짜는 YYYY-MM-DD 문자열을 그대로 표시하고 time의 dateTime에 전달해 시간대 변환을 피한다.

**Modify:** `apps/web/src/app/recruitments/page.tsx`

- [x] `const mockRecruitments: Recruitment[]`에 스터디/프로젝트, OPEN/CLOSED가 포함된 네 객체를 작성한다. 각 id는 고유한 숫자다.
- [x] 요청된 제목/부제를 표시하고 아래 ul/li 목록을 둔다. 목록 간격은 16px이다.
- [x] 페이지에서 다음 흐름을 직접 보여준다.

```tsx
<ul className="mt-8 space-y-4">
  {mockRecruitments.map((recruitment) => (
    <li key={recruitment.id}>
      <RecruitmentCard recruitment={recruitment} />
    </li>
  ))}
</ul>
```

- [x] key는 반복 결과의 최상위 li에 둔다. 배열 index를 사용하지 않는다.

## Task 3: 검증과 교육 기록

**Create:** `docs/session-08-checkpoint.md`

- [x] type → mock 배열 → map → props → 카드 흐름, key의 역할, Figma와 React의 대응을 설명한다.
- [x] 이 변경은 단순한 정적 UI이므로 새로운 테스트 프레임워크는 추가하지 않는다. 기존 검사와 실제 브라우저/HTTP 확인으로 검증한다.
- [x] 변경 파일만 Prettier로 정리한 뒤 `npm run format:check`, `npm run lint`, `npm run build`, `git diff --check`를 실행한다.
- [x] 빌드된 서버에서 `/`, `/recruitments` HTTP 200, 카드 4개, 두 상태 문구, 날짜, 공통 Header를 확인한다.
- [x] 브라우저에서 제목/부제, 카드 내용, 색상, 24px padding, 12px radius, 1px border, 본문 폭 1120px 및 작은 화면의 줄바꿈을 확인한다.
- [x] 변경 범위와 기존 4~7차시 커밋/작업 폴더 보존을 검토한다.
- [x] 실제 실행 명령과 결과를 checkpoint에 기록하고 문서 포맷을 재검사한다.
- [x] 이번 변경 파일만 stage하고 `git commit -m "feat: add recruitment list mock ui"`로 별도 커밋을 만든다. push/merge는 수행하지 않는다.
