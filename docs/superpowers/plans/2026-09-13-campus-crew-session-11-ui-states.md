# Campus Crew Session 11 UI States Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to execute this plan task by task. Track completion with checkboxes.

**Goal:** 모집글 목록에서 data / loading / empty / error를 수동으로 확인하고 최소 상태 UI를 재사용한다.

**Architecture:** 기존 Server Component 페이지에서 비동기 searchParams의 mode를 읽고 if 분기로 목록 영역을 선택한다. Header / Container / Mock 데이터 / RecruitmentCard는 그대로 사용한다. 새 공통 UI는 데이터 취득이나 상태 관리에 관여하지 않는다.

**Tech Stack:** 기존 Next.js App Router, React, TypeScript, Tailwind CSS, npm workspaces.

**Spec:** 이번 사용자 요청의 필수 범위, 디자인 기준, 학습 포인트를 기준으로 한다.

## Global Constraints

- 기준 커밋 `d02fe59` (10차시), 새 브랜치 `feat/session-11-recruitment-ui-states` 및 별도 worktree에서 진행한다.
- 4~10차시 커밋과 기존 worktree를 보존한다. 기존 목록 page 외 source/config/package/lockfile은 수정하지 않는다.
- 실제 API fetch, TanStack Query, 실제 retry, 검색/필터/pagination/auth, shadcn/ui, icon library를 추가하지 않는다.
- Empty 문구: `아직 등록된 모집글이 없습니다. 첫 번째 모집글을 작성해보세요.`
- Error 문구: `요청을 처리하는 중 문제가 발생했습니다.`
- 단순 Spinner와 텍스트를 사용하고 reduced motion을 존중한다. 상태 영역은 최소 높이 320px를 확보한다.
- 5차시 format:check / lint / build 명령과 설정을 유지한다.

## Task 1: 안전한 기준점과 검증 준비

- [x] 10차시 status/log를 확인하고 기준 커밋에서 별도 worktree와 브랜치를 생성한다.
- [x] 구현 전에 이 계획을 저장한다.
- [x] 기존 lockfile로 `npm ci --offline --no-audit --no-fund`를 실행한다. 캐시가 부족하면 승인된 네트워크 설치를 사용한다.
- [x] 변경 전 `npm run check`를 실행해 baseline을 확인한다.

## Task 2: 최소 상태 UI 및 목록 분기

**Files:**

- Create: `apps/web/src/components/ui/spinner.tsx`
- Create: `apps/web/src/components/ui/empty-state.tsx`
- Create: `apps/web/src/components/ui/error-message.tsx`
- Modify: `apps/web/src/app/recruitments/page.tsx`

**Interfaces:**

```tsx
// Spinner: label?: string, 기본값 '모집글을 불러오는 중입니다.'
// EmptyState: message: string, action?: ReactNode
// ErrorMessage: message: string, action?: ReactNode
// page: searchParams: Promise<{ mode?: string | string[] }>
```

- [x] Spinner는 `role="status"` 텍스트와 aria-hidden 원형 border indicator를 함께 표시한다. 회전은 `motion-safe:animate-spin`으로 한정한다.
- [x] EmptyState는 message와 선택적 action만 렌더링한다. 도메인 문구와 작성 Link는 page에서 전달한다.
- [x] ErrorMessage는 message에 `role="alert"`를 사용하고 선택적 action을 표시한다. page가 disabled 버튼 `다시 시도 (준비 중)`을 전달한다.
- [x] page에 다음 순서의 간단한 분기를 구현한다. `mode` 누락/미지원/중복 값은 기존 목록으로 돌아간다.

```tsx
const { mode } = await searchParams;
const recruitments = mode === 'empty' ? [] : mockRecruitments;
let content;
if (mode === 'loading') {
  content = <Spinner />;
} else if (mode === 'error') {
  // ErrorMessage에 지정 문구와 disabled button 전달
} else if (recruitments.length === 0) {
  // EmptyState에 지정 문구와 /recruitments/new Link 전달
} else {
  // 기존 ul / map / key / RecruitmentCard 유지
}
```

- [x] 제목과 부제를 분기 바깥에 유지하고 목록 영역에 `mt-8 min-h-80`을 적용한다. 디버그 패널이나 client state를 추가하지 않는다.

## Task 3: 실제 화면, 회귀 검증 및 학생 안내

**File:** Create `docs/session-11-checkpoint.md`.

- [x] 기본 주소와 `?mode=data`, `?mode=loading`, `?mode=empty`, `?mode=error`를 실제 브라우저에서 확인한다. 각 상태에서 다른 분기의 콘텐츠가 중복 표시되지 않는지 확인한다.
- [x] 미지원/중복 mode는 목록을 표시하는지 확인한다. Empty 작성 Link, 기존 목록 → 상세, 작성 폼 검증도 확인한다.
- [x] 좁은 화면의 상태 메시지/버튼/가로 넘침과 loading 영역 높이를 확인한다.
- [x] 체크포인트에 실행 방법, 상태별 URL, Empty와 Error의 차이, 조건부 렌더링, 최소 shared UI, 향후 isLoading/isError/data 매핑을 기록한다. Loading은 수동 시연으로 자동 완료되지 않으며 retry 버튼도 동작하지 않는다고 명시한다.
- [x] 변경 파일만 Prettier로 정리한 뒤 `npm run format:check`, `npm run lint`, `npm run build`, `git diff --check`를 실행한다.
- [x] diff와 이전 source/config/package의 보존을 검토한다.
- [x] 검증 결과를 기록하고 `feat: add recruitment ui states`로 별도 커밋한다. 기존 커밋을 수정하거나 원격에 push하지 않는다.

## Verification approach

이번 변경은 작은 표시 컴포넌트와 교육용 조건부 화면이다. 새 테스트 프레임워크나 구현을 그대로 복제한 단위 테스트를 추가하지 않는다. 기존 품질 검사와 실제 브라우저의 상태 분기·이동·폼 회귀 확인으로 검증한다.
