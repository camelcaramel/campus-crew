# Campus Crew Session 19 Create Mutation Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 기존 RHF + Zod 작성 폼으로 실제 모집글을 생성하고 목록을 최신 서버 데이터로 갱신한다.

**Architecture:** 기존 RecruitmentForm에서 useMutation과 useQueryClient를 사용한다. API 계층이 검증된 form values에 교육용 작성자 ID를 합쳐 POST한다. 성공하면 목록 prefix를 invalidate하고 router.push('/recruitments')한다.

**Tech Stack:** Next 16.3.4, React 19.3.0, TanStack Query 5.103.1, RHF 7.88.0, Zod 4.6.4, Nest 11, Prisma 7, PostgreSQL 17.

**Spec:** 사용자 요청의 19차시 핵심 범위·검증 시나리오가 설계 기준이다. 계획 작성 후 현재 세션에서 바로 실행한다.

## Global Constraints

- Base: 6f658ca. Branch: feat/session-19-create-mutation. 별도 session-19 worktree 사용.
- 4~18차시 branch/worktree/commit과 기존 DB 데이터 보존. 파괴적 Git 명령 금지.
- schema.ts와 기존 필드 유지. authorId 입력 필드, any, 신규 라이브러리 금지.
- DEMO_AUTHOR_ID는 api.ts 한 곳에 둔다. seed와 실제 DB users 조회에서 teacher id=1 확인.
- PATCH/DELETE UI, auth, applications, optimistic update, toast, 검색/필터/페이지네이션 제외.

## Review Focus

- HTTP 오류의 HTML 응답을 JSON으로 파싱하지 않고 사용자 오류로 전달한다.
- API 연결 실패 후 입력값을 보존하고 재제출할 수 있다.
- 요청 중 반복 클릭/Enter가 추가 POST를 발생시키지 않는다.
- 30초 staleTime 안에 방문했던 목록도 생성 후 최신 데이터를 가져온다.
- POST 응답의 author/date/status를 기존 상세 화면에서 그대로 사용한다.

## Task 1: POST API boundary

**Files:** apps/web/src/features/recruitments/api.ts, types.ts; apps/web/test/create-recruitment.test.mjs.

**Interfaces:** CreateRecruitmentInput = Pick<Recruitment, 'title' | 'category' | 'content'>; CreateRecruitmentRequest = CreateRecruitmentInput & { authorId: number }; createRecruitment(input: CreateRecruitmentInput): Promise<Recruitment>.

- [x] 기존 웹 테스트 5개로 baseline 확인.
- [x] 실제 임시 HTTP 서버를 사용하는 POST 테스트 작성. method/path/content-type/body와 실제 응답 반환, HTTP 400/500, 연결 종료, 잘못된 JSON 검증. 생성 함수 부재로 실패 확인.
- [x] api.ts에 const DEMO_AUTHOR_ID = 1과 auth 후 교체 주석을 둔다.
- [x] payload를 { ...input, authorId: DEMO_AUTHOR_ID }로 조립한다.
- [x] fetch('/api/recruitments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })를 사용한다.
- [x] non-ok는 '모집글을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.' Error로 거부한다. 네트워크 실패도 한국어 오류로 표시한다.
- [x] 전체 웹 테스트 통과 확인.

## Task 2: Existing form mutation

**Files:** apps/web/src/features/recruitments/recruitment-form.tsx. schema.ts와 new/page.tsx는 변경하지 않는다.

- [x] useState 제출 미리보기를 제거하고 useMutation, useQueryClient, useRouter를 연결한다.
- [x] mutationFn: createRecruitment; onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['recruitments'] }); router.push('/recruitments'); }.
- [x] handleSubmit에서 if (mutation.isPending) return 후 mutation.mutate(data)를 호출한다.
- [x] 버튼은 disabled={mutation.isPending}, pending 문구는 '등록 중...'을 사용한다. isSubmitting과 별도 상태를 중복 관리하지 않는다.
- [x] mutation.isError일 때 role=alert로 mutation.error.message를 폼 안에 표시한다. 필드별 Zod 오류와 구분하고 입력값은 보존한다.
- [x] 실제 브라우저에서 빈 입력 검증, 정상 생성, 목록 재조회, 상세 확인, API 중단 오류·재시도를 검증한다.

## Task 3: Verification and teaching record

**Files:** docs/session-19-create-mutation.md, README.md.

- [x] npm run format:check, npm run lint, npm run build 및 웹 테스트 실행.
- [x] 기존 API DB e2e 실행.
- [x] 기존 PostgreSQL 컨테이너를 재사용하고 이 worktree의 Nest/Next 실행.
- [x] 브라우저 POST /api/recruitments 201 확인. Network UI 접근 불가 시 정확한 대체 증거와 한계를 기록.
- [x] SQL로 생성 row, teacher 관계 확인. Nest 재시작 후 상세 GET 및 row 유지 확인.
- [x] 통제된 요청 지연으로 pending disabled와 중복 제출 방지를 검증할 수 있다. 검증용 도구는 제품 코드에 포함하지 않는다.
- [x] 19차시 문서에 요청 흐름, form vs payload, Zod vs server error, cache vs DB, 20차시 연결과 실제 검증 결과 기록.
- [x] 전체 diff 독립 리뷰, 필요한 수정과 재검증.
- [x] feat: connect recruitment create mutation 커밋. 기존 커밋 amend/merge/push 없음.

## Execution record

- 기존 18차시 clean worktree 및 연속된 4~18차시 이력을 확인했다.
- 별도 출력 worktree를 6f658ca에서 생성했다. 기존 수업용 Docker PostgreSQL healthy 확인.
- users 조회: teacher=1, student1=2, student2=3. seed는 재실행하지 않는다.
- 기존 시스템 npm launcher 경로가 깨져 공식 Node 설치의 npm.cmd를 사용한다.
