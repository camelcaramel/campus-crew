# Campus Crew Session 07 Shared Layout Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track the steps below.

**Goal:** Figma의 Header와 Container를 단순한 React 컴포넌트로 옮겨 기존 두 페이지에서 재사용한다.

**Architecture:** Header 내부에 기본 nav를 직접 작성한다. Container는 폭과 좌우 여백만 담당하고, layout.tsx는 Header와 main 안의 Container를 조립한다. 기존 page.tsx의 내용과 라우트는 유지한다.

**Tech Stack:** 기존 Next.js App Router, React, TypeScript, Tailwind CSS 4, npm workspaces.

**Spec:** 사용자가 제공한 7차시 고정 디자인 수치와 범위가 구현 기준이다. 별도 Figma 노드 URL은 제공되지 않았다.

## Global Constraints

- 6차시 `ceb4583`에서 분기한 `feat/session-07-shared-layout`과 별도 worktree에서 작업한다.
- 기존 4~6차시 worktree, 커밋, API, package/lockfile, 환경 예제, ESLint/Prettier 설정을 보존한다.
- Desktop frame 1440px, 실제 content max-width 1120px, page horizontal padding 32px, Header 전체 높이 64px.
- Tailwind의 border-box 기준 Container 최대 외곽 폭은 1184px = content 1120px + 좌우 32px이다. 1440px 화면에서는 content가 x=160부터 x=1280까지 놓인다.
- Primary 600 `#2563EB`, Neutral 900 `#111827`, Neutral 500 `#6B7280`, Neutral 200 `#E5E7EB`, White `#FFFFFF`.
- spacing은 4px scale, 주로 8/12/16/24/32를 사용한다.
- Header 왼쪽 로고 Campus Crew는 `/`, 오른쪽 모집글은 `/recruitments`로 이동한다.
- 로그인·회원가입은 disabled button으로 표시한다. 새 인증 라우트나 인증 동작을 만들지 않고, title로 후속 차시 예정임을 알린다.
- RecruitmentCard, 인증 상태 분기, API, TanStack Query, shadcn/ui, config-driven nav, compound component, 복잡한 반응형/애니메이션/gradient/illustration을 추가하지 않는다.

## Task 1: Baseline and shared layout

**Files:**

- Create: `apps/web/src/components/layout/container.tsx`
- Create: `apps/web/src/components/layout/header.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Modify: `apps/web/src/app/globals.css`

**Interfaces:** `Container({ children, className? })`는 ReactNode와 선택적 문자열을 받아 div를 반환한다. `Header()`는 props 없이 공통 헤더를 반환한다. 둘 다 Server Component로 유지한다.

- [x] 기존 캐시로 `npm ci --offline --no-audit --no-fund`를 실행하고 변경 전 `npm run check`를 확인한다.
- [x] Container를 `mx-auto w-full max-w-[1184px] px-8`과 선택적 className만으로 구현한다.
- [x] Header를 `h-16 border-b border-neutral-200 bg-white`로 구현한다. Container에 `flex h-full items-center justify-between gap-6`을 전달하고 nav는 `flex items-center gap-6 text-sm`으로 배치한다.
- [x] globals.css에 Tailwind `@theme` 색상 다섯 개를 정의한다. 기존 header/container/nav/main/a 전역 레이아웃 규칙은 새 Tailwind 컴포넌트로 옮기고, 기본 폰트·제목·키보드 포커스 스타일은 보존한다.
- [x] layout.tsx의 인라인 헤더를 Header로 교체하고 `<main className="py-8"><Container>{children}</Container></main>`으로 조립한다.

단순 정적 UI 변경에 별도의 테스트 프레임워크나 구현을 그대로 복제하는 단위 테스트는 추가하지 않는다. 실제 빌드와 브라우저의 크기·정렬·링크 동작으로 검증한다.

## Task 2: Classroom documentation and verification

**Files:**

- Modify: `README.md` (7차시 안내와 컴포넌트 구조)
- Create: `docs/session-07-checkpoint.md` (매핑, 크기 계산, 실습, 실제 검증 기록)

- [x] Figma component → React component, Header reuse, Container/max-width, layout.tsx composition을 설명하고 로그인/회원가입의 비활성 범위를 명시한다.
- [x] 변경 파일만 기존 Prettier로 정리한다.
- [x] 루트에서 `npm run format:check`, `npm run lint`, `npm run build`를 실행한다. lint/build는 API와 web 모두 통과해야 한다.
- [x] 빌드 서버에서 `/`와 `/recruitments`가 200인지 확인한다. 1440px 화면에서 Header 64px, content 1120px, 좌우 content 정렬, 지정 색상, 링크 이동 및 키보드 포커스를 확인한다.
- [x] `git diff --check`와 읽기 전용 리뷰로 범위·기존 차시 보존을 확인하고 실제 결과를 checkpoint에 기록한다.
- [x] `feat: add shared layout components`로 별도 커밋한다. 기존 커밋을 수정하거나 원격에 push하지 않는다.
