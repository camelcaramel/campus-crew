# Campus Crew Session 06 — Next App Router Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track steps with checkboxes.

**Goal:** 학생이 두 URL과 파일 경로의 관계, 공통 layout, Link 이동을 직접 확인한다.

**Architecture:** 기존 root layout에 공통 header/navigation/main을 둔다. Home과 Recruitments는 section 하나로 구성하며 Next.js가 해당 page를 children으로 전달한다. 별도 컴포넌트 추출이나 클라이언트 상태는 필요하지 않다.

**Tech Stack:** 기존 Next.js 16.3.4, React 19.3.0, TypeScript 5.9.3, Tailwind CSS 4.3.3, npm workspaces, ESLint, Prettier.

**Spec:** 2026-09-12 사용자의 6차시 구현 요청. 아래 Global Constraints가 승인된 범위를 기록한다.

## Global Constraints

- 4차시 main `8332381`, 5차시 `chore/session-05-dev-environment`의 `f6c4e44`와 기존 작업 파일을 보존한다.
- `f6c4e44`에서 새 `feat/session-06-next-app-router` 브랜치와 별도 `outputs/campus-crew-session-06` worktree를 만든다.
- 기존 커밋 수정, reset --hard, clean -fd, push --force는 사용하지 않는다.
- RecruitmentCard, TanStack Query, API 호출, 인증, 복잡한 UI 및 새 의존성을 추가하지 않는다.
- 5차시 ESLint/Prettier/환경 변수/lockfile/API 코드를 유지한다.
- 구현 전 이 계획을 저장하고 순서대로 실행한다. 최종 커밋은 `feat: add next app router foundation`으로 남긴다.

## Task 1: 기준 상태와 격리 확인

**Files:** 기존 package.json, package-lock.json, .prettierrc, .prettierignore, .gitignore, apps/web/src/app 세 파일을 읽는다.

- [x] Git 상태와 history를 읽고 4차시/5차시 커밋 및 깨끗한 5차시 작업 상태를 확인한다. 원격 저장소는 설정되어 있지 않다.
- [x] 별도 worktree를 생성하고 이 계획을 구현 전에 저장한다.
- [x] `npm ci --offline --no-audit --no-fund`로 잠금 파일대로 독립적인 의존성을 설치한다. 캐시가 부족하면 필요한 네트워크 권한을 요청해 일반 npm ci를 실행한다.
- [x] 기준 상태에서 `npm run format:check`, `npm run lint`, `npm run build`를 실행한다. 새 계획 문서는 기존 Prettier로 정리한다.

Windows npm 실행 환경은 기존 README 안내대로 현재 프로세스에서만 설정한다.

```powershell
$env:npm_config_prefix = Split-Path (Get-Command node).Source
npm ci --offline --no-audit --no-fund
npm run format:check
npm run lint
npm run build
```

## Task 2: 최소 App Router 화면

**Files:** Modify apps/web/src/app/layout.tsx, page.tsx, globals.css; Create apps/web/src/app/recruitments/page.tsx.

**Interfaces:** RootLayout({ children }: { children: ReactNode })와 두 default page 컴포넌트. URL `/`와 `/recruitments`. 데이터 입력이나 API 출력은 없다.

- [x] layout의 Metadata import, ReactNode 타입, globals.css import와 html lang="ko"를 유지한다. description은 서비스 소개로 갱신한다.
- [x] body에 아래 공통 구조를 둔다. main은 layout에 한 번만 정의한다.

```tsx
<header className="site-header">
  <div className="container">
    <p className="site-name">Campus Crew</p>
    <nav aria-label="주요 메뉴">
      <Link href="/">홈</Link>
      <Link href="/recruitments">모집글</Link>
    </nav>
  </div>
</header>
<main className="container">{children}</main>
```

- [x] next/link의 Link를 import하고 children 자리의 의미를 한 줄 주석으로 설명한다.
- [x] Home은 아래처럼 교체하고 파일 첫 줄에 `/` 대응 주석을 둔다.

```tsx
export default function HomePage() {
  return (
    <section>
      <h1>Campus Crew</h1>
      <p>함께 공부할 팀원을 만나보세요.</p>
    </section>
  );
}
```

- [x] `/recruitments` 대응 주석과 아래 안내용 page를 추가한다.

```tsx
export default function RecruitmentsPage() {
  return (
    <section>
      <h1>모집글</h1>
      <p>모집글 목록은 다음 차시부터 구현합니다.</p>
    </section>
  );
}
```

- [x] globals.css의 Tailwind import와 기존 시스템 폰트를 유지한다. body margin 0, 배경 #f8fafc, 글자 #0f172a, line-height 1.6을 적용한다. container는 max-width 70rem, 가로 padding 1.5rem, margin auto로 둔다. header는 흰 배경과 옅은 아래 테두리, 내부는 wrap 가능한 flex/gap으로 배치한다. main은 위아래 3rem 여백, h1은 2rem 굵기 700, 링크는 #1d4ed8 및 밑줄/키보드 focus outline을 사용한다. 별도 반응형 메뉴나 상태 로직은 만들지 않는다.

## Task 3: 검증, 수업 안내, 커밋

**Files:** Modify README.md; Create docs/session-06-checkpoint.md; Update this plan with results.

- [x] README의 현재 차시 안내와 web 실행 설명만 6차시에 맞추고 checkpoint 링크를 추가한다. 이전 차시 문서 본문은 보존한다.
- [x] docs/session-06-checkpoint.md에 경로→URL 표, children/layout 상속, Link 이동 실습, 실행 명령, 실제 검증 결과를 기록한다.
- [x] `npm run format` 후 diff를 확인하고 `npm run format:check`, `npm run lint`, `npm run build`를 실행한다. 전체 workspaces를 검사하여 API도 빌드됨을 확인한다.
- [x] `npm run start:web`로 빌드 결과를 실행한다. `/`와 `/recruitments` 직접 접속이 HTTP 200인지, 페이지 제목/본문과 공통 header/nav/main이 맞는지 확인한다.
- [x] 브라우저에서 홈→모집글→홈, 뒤로/앞으로, `/recruitments` 새로고침을 확인한다. 좁은 화면과 키보드 focus도 확인한다. 정적인 안내 화면 변경이므로 테스트 프레임워크나 구현을 복제하는 단위 테스트는 추가하지 않는다.
- [x] 검증을 위해 실행한 서버를 종료한다. `git diff --check`, 파일 목록 및 설정/lockfile/API 변경 없음, 기존 두 작업 공간의 상태와 커밋 보존을 확인한다.
- [x] 이 계획과 checkpoint에 결과를 기록하고 문서 포맷을 검사한다. 의도한 파일만 명시적으로 stage하고 별도 커밋을 생성한다.

```bash
git diff --check
git diff --stat
git add apps/web/src/app/layout.tsx apps/web/src/app/page.tsx apps/web/src/app/globals.css apps/web/src/app/recruitments/page.tsx README.md docs/session-06-checkpoint.md docs/superpowers/plans/2026-09-12-campus-crew-session-06-next-app-router.md
git commit -m "feat: add next app router foundation"
git status --short
git log -3 --oneline
```

## 학생 핵심 포인트

1. `/` → `apps/web/src/app/page.tsx`, `/recruitments` → `apps/web/src/app/recruitments/page.tsx`. app 자체는 URL 경로에 들어가지 않으며 폴더 아래 page.tsx가 화면을 공개한다.
2. root layout은 두 page를 감싼다. 공통 header는 유지되고 children으로 페이지 내용을 받는다.
3. Link의 href는 파일명이 아닌 URL이다. 내부 이동에 Next.js Link를 사용하며 별도 onClick이나 useRouter가 필요하지 않다.

공식 근거: [Next.js Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages).

## 실행 결과 및 계획 조정

- 위 구현과 검증 단계를 실행했다. 변경 전/후 모두 npm run check 종료 코드 0.
- 기본 npm 캐시의 EPERM은 읽기 권한 추가 후에도 지속되어, 이전 수업 work/npm-cache를 명시하여 오프라인 설치했다. 610개 패키지 설치 성공, 잠금 파일 변경 없음.
- 새 모집글 안내 page를 추가하고 공통 layout/Link 이동을 확인했다. 브라우저 왕복 이동·뒤로/앞으로·직접 접속·새로고침 통과.
- 기본 화면 및 375×812 화면과 키보드 포커스를 확인했다. 브라우저 크기 설정을 복원하고 검증 탭과 서버를 종료했다.
- 읽기 전용 리뷰를 반영해 README의 경로 표를 갱신했다. 실제 결과는 docs/session-06-checkpoint.md에 기록했다.
- 기존 두 worktree는 각각 main/8332381, chore/session-05-dev-environment/f6c4e44에 그대로 있으며 변경 사항이 없다.
- 마지막 작업은 아래 명시된 파일만 stage하고 요청한 메시지로 새 커밋을 생성하는 것이다. 커밋 ID와 최종 clean 상태는 사용자에게 완료 보고한다.
