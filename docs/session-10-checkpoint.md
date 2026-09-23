# 10차시 — React Hook Form + Zod로 모집글 작성하기

핵심 흐름은 **입력 → register → handleSubmit → Zod 검증 → errors 또는 onSubmit**입니다. 이번 차시는 브라우저에서 입력을 검증하고 결과를 확인합니다. 서버에 모집글을 저장하지 않습니다.

## 실행

10차시 worktree 루트에서 실행합니다.

```bash
npm ci
npm run dev:web
```

브라우저에서 `http://localhost:3000/recruitments/new`를 직접 엽니다. 기존 목록에 작성 링크를 추가하지 않았으므로 주소로 새 화면에 접근합니다. `/recruitments/new`는 고정 경로라 기존 `[id]` 상세 페이지보다 우선합니다.

검증 명령은 5차시 설정을 그대로 사용합니다.

```bash
npm run format:check
npm run lint
npm run build
git diff --check
```

`npm run check`는 앞의 세 npm 검사를 순서대로 실행합니다. lint/build는 web과 API workspace를 모두 검사합니다.

## 변경 파일과 패키지

| 파일                                                                                   | 역할                                    |
| -------------------------------------------------------------------------------------- | --------------------------------------- |
| `apps/web/src/app/recruitments/new/page.tsx`                                           | 제목·부제와 최대 폭 720px 영역, 폼 조립 |
| `apps/web/src/features/recruitments/schema.ts`                                         | 입력 검증 규칙과 추론 타입              |
| `apps/web/src/features/recruitments/recruitment-form.tsx`                              | 입력 연결, 오류 표시, 제출 결과         |
| `apps/web/package.json`                                                                | web 전용 패키지 추가                    |
| `package-lock.json`                                                                    | 정확한 설치 결과 기록                   |
| `docs/superpowers/plans/2026-09-13-campus-crew-session-10-recruitment-form-rhf-zod.md` | 구현 전 작성한 계획                     |
| `docs/session-10-checkpoint.md`                                                        | 실행·수업·검증 기록                     |

```bash
npm install --workspace=@campus-crew/web --save-exact react-hook-form zod @hookform/resolvers
```

설치 버전: `react-hook-form@7.88.0`, `zod@4.6.4`, `@hookform/resolvers@5.9.1`. 기존 Next.js/React/TypeScript/ESLint/Prettier 버전과 root scripts는 유지했습니다. resolver 설치로 lockfile에 optional peer 관련 항목도 추가됐지만 기존 687개 패키지 항목의 버전은 바뀌지 않았습니다.

## 1. 왜 uncontrolled form에 React Hook Form을 연결할까?

일반 HTML input은 브라우저가 입력 값을 보관합니다. 이것이 uncontrolled input의 출발점입니다. 입력할 때마다 모든 필드의 `value`와 `onChange`를 직접 React state로 관리하지 않고, React Hook Form에 필드를 등록해 값 수집과 검증을 맡깁니다.

이번 폼의 `useState` 하나는 입력 상태가 아니라 **마지막 유효한 제출 값의 화면 표시용**입니다. `watch`, `Controller`, 전역 상태, 필드별 useState는 사용하지 않습니다.

## 2. register는 input과 form state를 연결한다

```tsx
<input id="title" type="text" {...register('title')} />
<select id="category" defaultValue="" {...register('category')}>
  <option value="" disabled>카테고리를 선택해주세요</option>
  <option value="STUDY">스터디</option>
  <option value="PROJECT">프로젝트</option>
  <option value="CONTEST">공모전</option>
</select>
<textarea id="content" {...register('content')} />
```

`register('title')`이 돌려주는 name, ref, onChange, onBlur를 spread 문법으로 input에 전달합니다. React Hook Form은 어떤 필드가 바뀌었는지 추적하고 제출할 값을 수집합니다. `title` 등의 이름은 schema의 키와 같습니다.

카테고리의 초기 빈 option은 아직 선택하지 않은 화면 상태입니다. 유효한 제출 타입에는 빈 문자열을 추가하지 않습니다. 빈 값으로 등록하면 Zod enum 검증이 실패합니다.

## 3. Zod schema가 규칙의 단일 기준이다

`schema.ts`에서 title은 2~~80자, content는 10~~2000자, category는 STUDY/PROJECT/CONTEST로 정의합니다. 길이는 입력 원문 기준입니다. trim 같은 변환은 추가하지 않았습니다.

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<RecruitmentFormValues>({
  resolver: zodResolver(recruitmentFormSchema),
  defaultValues: { title: '', content: '' },
});
```

`zodResolver`가 Zod와 React Hook Form 사이를 연결합니다. 규칙을 register 옵션이나 HTML minLength/maxLength에 다시 작성하지 않습니다. form의 `noValidate`는 브라우저 기본 검증 팝업을 끄고 이번 차시의 Zod 오류 메시지 흐름을 보여주기 위한 속성입니다.

기존 목록/상세의 category는 `'스터디' | '프로젝트'`인 표시용 Mock 타입입니다. 4~9차시의 소스를 보존하기 위해 그대로 두었습니다. 새 작성 입력의 영문 코드는 schema에만 union 규칙을 정의하며 별도 타입이나 shared constants를 중복 생성하지 않았습니다. 실제 API 연결 시 표시 이름과 저장 코드를 연결하는 것은 이후 차시에서 다룹니다.

## 4. z.infer로 schema와 TypeScript 타입을 연결한다

```ts
export type RecruitmentFormValues = z.infer<typeof recruitmentFormSchema>;
```

Zod는 실행 중 실제 값이 규칙에 맞는지 검사합니다. TypeScript 타입은 개발 중 필드명과 값의 형태를 검사합니다. z.infer를 사용하면 별도 interface를 작성하지 않고 schema에서 타입을 얻습니다. 두 역할을 연결하지만, TypeScript만으로 실제 사용자 입력이 검증되는 것은 아닙니다.

## 5. handleSubmit은 검증을 통과한 값만 전달한다

```tsx
function onSubmit(data: RecruitmentFormValues) {
  setSubmittedData(data);
}

<form noValidate onSubmit={handleSubmit(onSubmit)}>
  {/* 입력 필드 */}
</form>;
```

브라우저의 제출 이벤트를 `handleSubmit`이 받아 값을 수집하고 resolver 검증을 실행합니다. 통과하면 `onSubmit(data)`를 호출하고, 실패하면 errors를 갱신합니다. `onSubmit`에 이벤트 객체가 아니라 검증된 데이터가 전달되는 점을 확인합니다.

## 6. errors를 각 필드 아래에 표시한다

```tsx
{
  errors.title && (
    <p id="title-error" role="alert" className="mt-2 text-sm text-red-600!">
      {errors.title.message}
    </p>
  );
}
```

input에는 오류 여부에 따라 red border, `aria-invalid`, `aria-describedby`를 적용합니다. label의 htmlFor와 input의 id도 연결합니다. 기존 globals.css의 p 색상 선언을 유지하기 위해 Tailwind 4의 끝 `!`로 오류 메시지 색상 우선순위를 명시했습니다.

첫 검증은 등록을 누를 때 실행됩니다. 제출 실패 후 필드를 고치면 React Hook Form 기본 동작에 따라 해당 필드가 다시 검증됩니다.

## 7. 왜 'use client'가 필요할까?

RecruitmentForm은 `useForm`, `useState`, 브라우저 입력 이벤트와 제출 이벤트를 사용하므로 Client Component입니다. 파일 맨 위에 `'use client'`를 선언합니다. 페이지와 RootLayout 전체를 Client Component로 바꾸지는 않습니다. 기존 RootLayout이 Header와 Container를 제공하므로 새 페이지에서 중복으로 렌더링하지 않습니다.

## 8. 등록 성공은 아직 API 저장 성공이 아니다

화면의 **마지막 유효한 제출 값**에는 JSON과 API 미전송 안내가 표시됩니다. 입력값도 그대로 남습니다. 이후 편집 중인 값과 마지막 제출 결과는 다를 수 있습니다. 새로고침하거나 취소로 이동하면 메모리의 결과는 사라지며 목록의 Mock 데이터는 늘어나지 않습니다.

이번에는 fetch/POST, TanStack Query mutation, 서버 validation, 인증, 수정 폼, toast, shadcn/ui, 자동 reset/이동을 구현하지 않았습니다. 취소는 Next.js Link로 `/recruitments`에 이동합니다.

## 화면 기준

사용자가 지정한 F06 구조와 수치를 적용했습니다. Figma 원본 파일을 직접 대조한 검증은 아닙니다.

- 제목 `모집글 작성`, 부제 `함께할 팀원을 모집해보세요.`.
- 폼 폭 최대 720px, 필드 사이 간격 24px.
- input/select 높이 40px, textarea 최소 높이 160px.
- input/select/textarea/버튼 모서리 8px.
- 등록 버튼 기존 `primary-600` 토큰: `#2563EB`.
- 오류 필드 red border 및 바로 아래 한국어 오류 메시지.

## 학생 확인 과제

1. 아무것도 입력하지 않고 등록해 세 필드 오류를 확인합니다.
2. 제목 1자/2자, 내용 9자/10자로 최소 길이 경계를 비교합니다.
3. 제목 80자/81자, 내용 2000자/2001자로 최대 길이 경계를 비교합니다.
4. 세 카테고리를 각각 선택하고 제출 JSON의 영문 코드를 확인합니다.
5. 입력이 틀리면 제출 결과가 새로 생성되지 않는지 확인합니다.
6. 유효한 값으로 등록한 뒤 주소와 입력값이 유지되고, API 미전송 안내가 나오는지 확인합니다.
7. 취소로 목록에 돌아가 Mock 카드 수가 그대로인지 확인합니다.
8. register, handleSubmit, errors, schema, z.infer의 역할을 한 문장씩 설명합니다.

## 실제 검증 기록

실행일: 2026-09-13. Windows / Node.js 22.17.1 / npm 10.9.2.

| 검사           | 결과                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 변경 전 앱     | format:check, web·API lint/build 통과                                                                                     |
| 구현 후        | `npm run check` 종료 코드 0. format:check, web·API lint/build 모두 통과                                                   |
| 빌드 route     | 기존 `/`, `/recruitments`, `/recruitments/[id]` 유지 + 정적 `/recruitments/new` 생성                                      |
| schema         | 빈 값, 최소/최대 경계, 카테고리 3종/빈 값/미지원 값/누락, 오류 path 및 반환값 보존 18개 검사 통과                         |
| 브라우저 오류  | 빈 제출 세 필드 오류, title 1/content 9 최소 오류, title 81/content 2001 최대 오류, 오류 수정 후 통과                     |
| 브라우저 제출  | STUDY/PROJECT/CONTEST 각각 올바른 JSON 표시, 자동 이동/reset 없음                                                         |
| 브라우저 이동  | 취소 → 목록, 기존 목록 첫 제목 → 상세 1 정상                                                                              |
| HTTP           | 홈·목록·작성·상세 1~4 HTTP 200, 999/abc/1abc HTTP 404                                                                     |
| 데스크톱 실측  | 폼 720px, input/select 40px, textarea 160px, radius 8px, 필드 간격 24px, primary rgb(37,99,235)                           |
| 모바일         | 390px viewport에서 가로 넘침 없음, 필드·버튼·결과 확인. 기존 Header는 좁은 폭에서 메뉴 글자가 줄바꿈되는 상태 그대로 보존 |
| 별도 코드 리뷰 | 수정이 필요한 발견 사항 없음. 기존 source와 기존 패키지 버전 보존 확인                                                    |

이 환경에서는 기본 npm 실행기가 접근할 수 없는 전역 npm 경로를 선택했습니다. 시스템 설정은 변경하지 않고 현재 터미널의 환경 변수만 지정하여 설치/검증했습니다. 처음 offline 설치는 기존 캐시 권한 문제로 실패했고 작업 폴더 캐시와 승인된 네트워크로 재설치해 성공했습니다. 패키지 추가는 종료 코드 0이며 optional 의존성 임시 폴더 정리 경고가 있었습니다.

```powershell
$env:npm_config_prefix = 'C:\Program Files\nodejs'
$env:npm_config_cache = 'C:\Users\v2008\Documents\Codex\2026-09-13\referenced-chatgpt-conversation-this-is-an-3\work\npm-cache'
npm ci --no-audit --no-fund
npm run check
```

브라우저 검증은 기존 포트와 충돌하지 않도록 production build를 `127.0.0.1:3010`에서 실행했습니다. 학생의 일반 개발 실행 명령은 문서 첫 부분의 `npm run dev:web`입니다.

## 기존 코드 보존

9차시 커밋 `17a318b`에서 `feat/session-10-recruitment-form-validation` 브랜치를 새 worktree로 분기했습니다. 이번 변경은 소스 3개와 문서 2개 추가 및 web/package.json, lockfile 수정뿐입니다. 4~9차시 브랜치, worktree, 커밋과 기존 source/config는 보존했습니다.

커밋 메시지: `feat: add recruitment form validation`.

worktree는 기존 Campus Crew 저장소의 Git 기록을 공유하므로 폴더를 임의로 이동하지 않습니다.

## 공식 참고

- [React Hook Form 예제](https://github.com/react-hook-form/react-hook-form/blob/master/README.md)
- [Zod resolver 연결](https://github.com/react-hook-form/resolvers)
- [Zod 기본 사용과 타입 추론](https://zod.dev/basics)
