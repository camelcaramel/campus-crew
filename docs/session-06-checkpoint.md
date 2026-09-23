# 6차시 — Next.js App Router 기본 구조

이번 실습에서는 URL에 맞는 페이지가 열리고, 두 페이지가 같은 헤더를 사용하는지 확인합니다. 모집글 목록은 안내 문구만 표시합니다.

## 파일 경로와 URL

| 접속 URL        | 화면 파일                                |
| --------------- | ---------------------------------------- |
| `/`             | `apps/web/src/app/page.tsx`              |
| `/recruitments` | `apps/web/src/app/recruitments/page.tsx` |

`apps/web/src/app`은 라우팅 기준 폴더입니다. `app` 자체는 URL에 들어가지 않습니다. `recruitments` 폴더 아래 `page.tsx`를 만들면 `/recruitments` 화면이 생깁니다. 폴더만 만들고 `page.tsx`를 만들지 않으면 그 폴더의 페이지 화면은 생기지 않습니다.

## 공통 layout과 children

```text
app/layout.tsx
├── header: Campus Crew + 홈/모집글 Navigation
└── main: children
    ├── / 접속 시 app/page.tsx
    └── /recruitments 접속 시 app/recruitments/page.tsx
```

두 페이지가 동시에 표시된다는 뜻은 아닙니다. 현재 URL의 page가 `children` 자리에 들어갑니다. Next.js가 이 연결을 처리하므로 layout에서 각 page를 직접 import하지 않습니다.

root layout은 `<html lang="ko">`와 `<body>`를 포함하며 전역 스타일도 불러옵니다. header/nav/main은 공통 layout에 한 번만 정의하고, page는 자신의 section 내용을 반환합니다. 이것이 이번 차시에서 확인할 layout 상속입니다.

## Link Navigation

```tsx
<Link href="/">홈</Link>
<Link href="/recruitments">모집글</Link>
```

`Link`는 `next/link`에서 불러옵니다. href에는 `.tsx` 파일 경로가 아닌 URL을 넣습니다. Next.js 내부 이동에 사용하므로 별도 클릭 이벤트나 `useRouter` 없이 두 페이지를 오갈 수 있습니다. 공유 layout은 내부 이동 중 유지됩니다.

## 실습 순서

프로젝트 루트에서 실행합니다.

```bash
npm ci
npm run dev:web
```

1. `http://localhost:3000/`에서 Campus Crew와 소개 문구를 확인합니다.
2. 헤더의 모집글을 눌러 주소가 `/recruitments`로 바뀌는지 확인합니다.
3. 모집글 제목과 다음 차시 안내가 보이면서 같은 헤더가 유지되는지 확인합니다.
4. 홈을 눌러 `/`로 돌아옵니다. 브라우저 뒤로/앞으로도 사용해 봅니다.
5. 주소창에 `/recruitments` 주소를 직접 입력하고 새로고침해도 같은 화면이 열리는지 확인합니다.
6. Tab 키로 링크를 이동할 때 포커스 테두리가 보이는지 확인합니다.

API 서버나 환경 파일 없이 이 실습을 할 수 있습니다. 5차시에 만든 환경 변수 예제와 디렉터리 규칙은 그대로 유지됩니다.

개발 서버를 종료한 뒤 전체 검사를 실행합니다.

```bash
npm run format
npm run format:check
npm run lint
npm run build
```

`npm run check`는 format:check → lint → build를 순서대로 실행하는 기존 통합 명령입니다. lint/build는 web과 api 모두 검사합니다. 빌드 결과 확인은 `npm run start:web`로 합니다.

## 이전 차시 보존

- 4차시: `main`, `8332381`.
- 5차시: `chore/session-05-dev-environment`, `f6c4e44`.
- 6차시: 5차시에서 분기한 `feat/session-06-next-app-router`, 별도 `campus-crew-session-06` worktree.

기존 두 작업 폴더는 수정하지 않습니다. worktree는 Git 기록을 공유하므로 일반 폴더처럼 임의로 이동하지 않습니다. 두 차시의 차이는 아래 읽기 전용 명령으로 볼 수 있습니다.

```bash
git diff chore/session-05-dev-environment..feat/session-06-next-app-router -- apps/web/src/app
```

## 학생 완료 체크리스트

- [ ] URL을 보고 해당 page.tsx 위치를 찾을 수 있다.
- [ ] layout의 children 자리에 무엇이 들어가는지 설명할 수 있다.
- [ ] Link의 href에 올바른 URL을 작성할 수 있다.
- [ ] 직접 접속, 링크 이동, 새로고침을 모두 확인했다.
- [ ] 전체 format:check/lint/build가 통과한다.
- [ ] git diff를 읽고 변경을 별도 커밋으로 기록했다.

## 제작 시 실제 검증 결과

실행일: **2026-09-12**, Windows / Node.js **22.17.1** / npm **10.9.2**.

| 검사              | 결과                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 설치              | 이전 수업 작업 폴더의 npm 캐시로 `npm ci --offline --no-audit --no-fund` 성공, 610개 패키지 설치                                          |
| 변경 전 기준 검사 | `npm run check` 종료 코드 0: 전체 format:check와 api/web lint/build 통과                                                                  |
| 포맷 정리         | `npm run format` 성공; 기존 차시 문서와 설정에 포맷 변경 없음                                                                             |
| 구현 후 전체 검사 | `npm run check` 종료 코드 0: format:check와 api/web lint/build 통과                                                                       |
| Next.js 빌드 경로 | `/`, `/recruitments` 모두 정적 페이지로 생성됨                                                                                            |
| 실행              | `npm run start:web`로 빌드 결과 실행                                                                                                      |
| HTTP              | `/`, `/recruitments` 각각 200; 각 응답에 header/nav/main이 하나씩 있고 두 URL의 링크 모두 존재                                            |
| 브라우저          | 홈→모집글→홈, 뒤로/앞으로, `/recruitments` 직접 접속과 새로고침 정상                                                                      |
| 화면·접근성       | 공통 헤더와 페이지별 제목·본문 확인. 375×812 화면의 두 페이지 표시 정상, 모집글 페이지 가로 넘침 없음. Tab 이동 시 2px 포커스 테두리 확인 |
| 보존 검사         | package/lockfile, API, 환경 예제, ESLint/Prettier 설정, 4·5차시 checkpoint 변경 없음. 원본 두 worktree의 추적/미추적 변경 없음            |
| 변경 검사         | `git diff --check` 통과. 읽기 전용 리뷰에서 소스 문제 없음; README 구조표 갱신과 이 검증 기록 추가 반영                                   |

검증용 브라우저 탭을 닫고 화면 크기 설정을 복원했습니다. 실행했던 web 서버도 종료했습니다.

### 실행 환경 메모

- 현재 프로세스에만 `npm_config_prefix=C:\Program Files\nodejs`를 적용했습니다. 전역 npm 설정은 바꾸지 않았습니다.
- 기본 npm 캐시에서 EPERM 오류가 발생하여 4차시 작업 폴더의 `work/npm-cache`를 사용했습니다. 5차시 잠금 파일을 유지했고 네트워크 설치나 의존성 변경은 없었습니다.
- 기존 ESLint 9 지원 종료 경고가 설치 시 표시됩니다. 이번 차시에 버전을 변경하지 않았으며 audit는 새로 실행하지 않았습니다.
- 원격 저장소가 등록되어 있지 않아 이 결과는 로컬 브랜치와 worktree에 보관합니다.
- 루트 package.json의 5차시 description은 lockfile과 함께 기존 값을 유지합니다. 현재 수업 안내는 이 문서와 README를 기준으로 봅니다.

공식 참고: [Next.js Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages).
