# Campus Crew Session 10 Recruitment Form Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Track completed steps with checkboxes.

**Goal:** `/recruitments/new`에서 React Hook Form과 Zod로 입력 검증과 유효한 제출 값을 확인한다.

**Architecture:** RootLayout의 Header/Container를 상속하는 Server Component 페이지에 Client Component인 RecruitmentForm을 배치한다. schema.ts를 입력 규칙과 추론 타입의 단일 기준으로 사용하고 zodResolver로 React Hook Form에 연결한다. 제출 시 useState 하나에 마지막 유효한 값만 저장하여 화면에 표시한다.

**Tech Stack:** 기존 Next.js 16 / React 19 / TypeScript 5 / Tailwind CSS 4 / npm workspaces, react-hook-form, zod, @hookform/resolvers.

**Spec:** 이번 작업의 사용자 요청(10차시 필수 범위, F06 디자인 수치, 제외 범위). 별도 설계 승인을 다시 요구하지 않고 명시된 구현 요청을 실행한다.

## Global Constraints

- 시작 커밋: 9차시 `17a318bc462ada2868585604f0a157628a4b5687`.
- 브랜치: `feat/session-10-recruitment-form-validation`; 별도 `outputs/campus-crew-session-10` worktree.
- 4~9차시 브랜치/worktree/커밋 및 기존 코드 보존. reset --hard, clean -fd, push --force 금지.
- title 2~~80자, content 10~~2000자, category STUDY/PROJECT/CONTEST.
- 제목 `모집글 작성`, 부제 `함께할 팀원을 모집해보세요.`.
- 폼 최대 720px, input/select 높이 40px, textarea 최소 160px, 모서리 8px, 필드 간격 24px, primary #2563EB.
- 오류 시 해당 필드 red border와 바로 아래 한국어 메시지. label, aria-invalid, aria-describedby로 연결.
- 취소는 `/recruitments`로 Link 이동. 등록은 validation 이후 화면 표시만 수행.
- API POST, mutation, 서버 validation, auth, edit, shadcn/ui, toast, reset/자동 이동, 복잡한 상태 관리 없음.
- 기존 category는 한글 표시용 union('스터디' | '프로젝트')이다. 기존 Mock/상세/카드를 보존하고 작성 폼의 영문 코드 타입만 schema에서 추론한다. 별도 영문 union/shared constants를 만들지 않는다.
- 5차시 root scripts, formatting, lint, framework versions 변경 없음.

## Task 1: 의존성 및 입력 schema

**Files:** Modify `apps/web/package.json`, `package-lock.json`; create `apps/web/src/features/recruitments/schema.ts`.

**Interfaces:** `recruitmentFormSchema`, `RecruitmentFormValues = z.infer<typeof recruitmentFormSchema>`.

- [x] 기존 lockfile로 설치하고 변경 전 format:check/lint/build 확인.
- [x] `npm install --workspace=@campus-crew/web --save-exact react-hook-form zod @hookform/resolvers` 실행. 기존 버전은 유지.
- [x] 아래 schema 구현. 입력 길이는 원문 기준이며 trim 등 숨은 변환은 추가하지 않는다.

```ts
export const recruitmentFormSchema = z.object({
  title: z
    .string()
    .min(2, '제목은 2자 이상 입력해주세요.')
    .max(80, '제목은 80자 이하로 입력해주세요.'),
  category: z.enum(['STUDY', 'PROJECT', 'CONTEST'], {
    error: '카테고리를 선택해주세요.',
  }),
  content: z
    .string()
    .min(10, '내용은 10자 이상 입력해주세요.')
    .max(2000, '내용은 2000자 이하로 입력해주세요.'),
});
export type RecruitmentFormValues = z.infer<typeof recruitmentFormSchema>;
```

- [x] schema 검증: title 1/2/80/81, content 9/10/2000/2001, 세 category/빈 값/미지원 값. 각 오류 path 확인. 별도 테스트 프레임워크는 추가하지 않는다.

## Task 2: 작성 화면 및 폼

**Files:** Create `apps/web/src/app/recruitments/new/page.tsx`, `apps/web/src/features/recruitments/recruitment-form.tsx`.

**Interfaces:** Server page → `<RecruitmentForm />`; client form → `recruitmentFormSchema`/`RecruitmentFormValues`.

- [x] page에 `mx-auto max-w-[720px]`, 제목과 부제, 폼을 배치한다. Header/Container는 상속한다.
- [x] 폼에 `'use client'`를 선언한다. 아래 흐름을 사용한다.

```tsx
const [submittedData, setSubmittedData] =
  useState<RecruitmentFormValues | null>(null);
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<RecruitmentFormValues>({
  resolver: zodResolver(recruitmentFormSchema),
  defaultValues: { title: '', content: '' },
});
function onSubmit(data: RecruitmentFormValues) {
  setSubmittedData(data);
}
// <form noValidate onSubmit={handleSubmit(onSubmit)}>
// <input {...register('title')} />
// <select defaultValue="" {...register('category')}> ... </select>
// <textarea {...register('content')} />
// {errors.title && <p id="title-error" role="alert">{errors.title.message}</p>}
```

- [x] 카테고리 option은 빈 선택 안내 및 STUDY(스터디)/PROJECT(프로젝트)/CONTEST(공모전)이다.
- [x] 각 필드의 className에 errors에 따른 red border 적용. 전역 p 색상 우선순위에 맞춰 오류 메시지에는 Tailwind `text-red-600!` 사용.
- [x] native required/minLength/maxLength 검증은 중복하지 않는다. `noValidate`로 Zod 메시지 흐름을 학습한다.
- [x] 취소 Link와 type=submit 등록 버튼 구현. 입력 값은 개별 useState/value로 제어하지 않는다.
- [x] 마지막 유효한 제출 값 JSON과 API 미전송 안내를 표시한다. 자동 reset/이동 없음. 마지막 결과임을 명시하여 편집 중 값과 혼동하지 않게 한다.
- [x] 브라우저: 빈 제출, 길이 오류, 오류 수정 후 유효한 제출, 카테고리 선택, 취소 이동, 기존 목록/상세/404 유지 확인.
- [x] 데스크톱/모바일 폭 및 필드 높이·색상·오류 메시지 시각 검증.

## Task 3: 교육 문서 및 완료 검증

**Files:** Create `docs/session-10-checkpoint.md`; update this plan's checkboxes.

- [x] uncontrolled input, register, handleSubmit, errors, zodResolver, z.infer, use client, API 미전송을 예제 중심으로 정리한다.
- [x] 설치 패키지 버전, 실행 명령, 검증 기록 및 보존 근거를 기록한다.
- [x] 변경 파일만 prettier로 정리한 뒤 `npm run format:check`, `npm run lint`, `npm run build`, `git diff --check` 실행한다.
- [x] diff에서 기존 source/config 보존 및 제외 범위 유입이 없는지 검토한다.
- [x] `feat: add recruitment form validation` 새 커밋 생성. push/merge/amend 없음.
- [x] 커밋과 clean status, 4~9차시 worktree HEAD 보존을 확인하고 사용자에게 파일·명령·검증·학습 포인트를 요약한다.
