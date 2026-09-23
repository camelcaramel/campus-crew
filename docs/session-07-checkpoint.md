# 7차시 — Figma의 Header와 Container를 코드로 옮기기

이번 차시에서는 디자인의 공통 구조를 React 컴포넌트로 옮깁니다. 기존 홈과 모집글 안내 문구는 그대로 유지합니다.

## Figma component → React component

| Figma 기준     | 코드                                           | 역할                                   |
| -------------- | ---------------------------------------------- | -------------------------------------- |
| Header         | `apps/web/src/components/layout/header.tsx`    | 로고와 기본 nav를 담는 공통 헤더       |
| Container      | `apps/web/src/components/layout/container.tsx` | 본문 최대 폭과 좌우 여백               |
| 공통 화면 구조 | `apps/web/src/app/layout.tsx`                  | Header, main, Container, children 조립 |
| 색상 기준      | `apps/web/src/app/globals.css`                 | Tailwind 색상 이름과 hex 값 연결       |

Header 내부에 nav를 직접 작성했습니다. 아직 메뉴 설정 배열, 별도 Nav 컴포넌트, 인증 상태, 클릭 이벤트는 필요하지 않습니다. 두 컴포넌트 모두 `use client` 없이 사용할 수 있습니다.

## Header reuse와 layout.tsx composition

```tsx
<Header />
<main className="py-8">
  <Container>{children}</Container>
</main>
```

`layout.tsx`에서 Header를 한 번 배치하면 `/`와 `/recruitments`가 같은 헤더를 사용합니다. 현재 URL의 page가 `children` 자리에 들어갑니다. 페이지마다 Header를 복사하면 메뉴나 높이를 바꿀 때 여러 파일을 수정해야 합니다.

로고를 누르면 `/`, 모집글을 누르면 `/recruitments`로 이동합니다. 로그인·회원가입은 후속 인증 차시에서 연결할 비활성 버튼입니다. 아직 존재하지 않는 화면으로 이동시키지 않으며 실제 인증 기능도 없습니다. 비활성 버튼은 Tab 순서에서 제외됩니다.

## Container와 max-width

```tsx
<div className={`mx-auto w-full max-w-[1184px] px-8 ${className}`}>
  {children}
</div>
```

Tailwind의 기본 border-box에서는 padding도 지정 폭에 포함됩니다. 따라서 실제 content 최대 폭을 1120px로 만들려면 외곽 최대 폭은 `1120 + 32 + 32 = 1184px`입니다. `max-w-[1120px] px-8`만 사용하면 실제 content는 1056px가 됩니다.

- 1440px 화면: 외곽 Container 1184px, 바깥 여백 각각 128px, 내부 padding 각각 32px, 실제 content는 x=160~1280.
- 1184px보다 좁은 화면: `w-full`로 외곽 폭이 줄어들고 좌우 padding 32px이 유지됩니다.
- `mx-auto`: 남는 좌우 공간을 같게 나눕니다.
- `px-8`: 기본 4px spacing 기준 32px씩입니다.
- 선택적 `className`: Header에서만 flex 배치와 높이 상속을 추가합니다. 폭 규칙은 Header와 main에서 같습니다.

Desktop frame 1440px은 검증 기준입니다. 웹 화면을 `width: 1440px`로 고정하지 않습니다. 이번에는 모바일 메뉴나 복잡한 반응형 분기를 만들지 않습니다.

## 높이·여백·색상

Header의 `h-16`은 64px이며 아래 1px 테두리를 포함합니다. `items-center`는 세로 정렬, `justify-between`은 로고와 nav의 좌우 배치, `gap-6`은 24px 간격입니다. main의 `py-8`은 위아래 32px입니다.

| 디자인 이름 | 값        | 용도                         |
| ----------- | --------- | ---------------------------- |
| Primary 600 | `#2563EB` | 로고와 키보드 포커스         |
| Neutral 900 | `#111827` | 제목과 모집글 메뉴           |
| Neutral 500 | `#6B7280` | 안내 문구와 비활성 인증 메뉴 |
| Neutral 200 | `#E5E7EB` | Header 아래 테두리           |
| White       | `#FFFFFF` | 페이지와 Header 배경         |

## 실습과 검사

프로젝트 루트에서 실행합니다.

```bash
npm ci
npm run dev:web
```

1. 1440px 화면에서 Header의 로고와 본문 제목의 왼쪽 정렬을 비교합니다.
2. 모집글을 눌러 헤더는 유지되고 page 내용만 바뀌는지 확인합니다.
3. 로고를 눌러 홈으로 돌아옵니다.
4. `/recruitments`에 직접 접속하고 새로고침합니다.
5. Tab으로 로고와 모집글을 이동하고 파란 포커스 테두리를 확인합니다.
6. Container의 폭과 padding이 구분되는 이유를 설명합니다.

```bash
npm run format:check
npm run lint
npm run build
git diff --check
```

필요한 파일만 포맷하거나 기존 `npm run format`을 사용합니다. `npm run check`는 위 세 npm 검사를 순서대로 실행합니다. lint와 build는 web과 API 모두 검사합니다.

## 이전 차시 보존

- 4차시: `main`, `8332381`.
- 5차시: `chore/session-05-dev-environment`, `f6c4e44`.
- 6차시: `feat/session-06-next-app-router`, `ceb4583`.
- 7차시: `feat/session-07-shared-layout`, 별도 `campus-crew-session-07` worktree.

```bash
git diff feat/session-06-next-app-router..feat/session-07-shared-layout -- apps/web/src
```

Git 기록을 공유하는 worktree이므로 폴더를 임의로 이동하지 않습니다. 기존 page 파일, API, 의존성, 잠금 파일, 환경 예제, 5차시 개발 규칙은 이번 변경 범위에 포함하지 않습니다.

## 실제 검증 기록

실행일: 2026-09-12. Windows, Node.js 22.17.1, npm 10.9.2.

| 검사         | 결과                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| 설치         | 기존 캐시로 `npm ci --offline --no-audit --no-fund`, 종료 코드 0, 610개 패키지 설치                        |
| 변경 전 기준 | 6차시 worktree에서 `npm run check`, 종료 코드 0                                                            |
| 변경 후 검사 | 7차시 worktree에서 `npm run check`, 종료 코드 0. `format:check`, API/web `lint`, API/web `build` 모두 통과 |
| 빌드 라우트  | `/`, `/recruitments` 모두 정적 페이지로 생성                                                               |
| 실행         | `node node_modules/next/dist/bin/next start apps/web --hostname 127.0.0.1 --port 3107`로 검증용 서버 실행  |
| HTTP         | `/`, `/recruitments` 각각 200. 각 응답에 header/main이 하나씩 존재                                         |
| 실제 크기    | 1440×900 viewport, Header 높이 64px, Container 외곽 폭 1184px, 좌우 padding 각각 32px, content 폭 1120px   |
| 정렬과 여백  | 로고와 본문 x=160, nav와 본문 오른쪽 x=1280, main 상단 여백 32px                                           |
| 실제 색상    | 로고 `#2563EB`, 제목 `#111827`, 안내 `#6B7280`, 1px 테두리 `#E5E7EB`, 배경 `#FFFFFF` 확인                  |
| 이동         | 홈→모집글→로고로 홈, 모집글 직접 접속과 새로고침 정상                                                      |
| 키보드·콘솔  | Tab 이동 시 2px 파란 포커스와 4px offset 확인. 로그인/회원가입 disabled. 브라우저 warning/error 없음       |
| 코드 리뷰    | 기능상 문제 없음. README 구조표와 layout 역할 설명 보완                                                    |
| 보존         | 4·5·6차시 HEAD가 각각 8332381/f6c4e44/ceb4583으로 유지되고 세 worktree 모두 clean                          |
| 변경 범위    | 기존 page 파일, API, package/lockfile, 환경 예제, ESLint/Prettier 설정 변경 없음. `git diff --check` 통과  |

검증용 서버와 브라우저 탭을 종료하고 viewport 설정을 복원했습니다. 마무리 문서 수정 뒤 format:check를 다시 확인했습니다.

실행 환경에서는 현재 프로세스에만 `npm_config_prefix=C:\Program Files\nodejs`를 적용하고, 4차시 작업의 `work/npm-cache`를 재사용했습니다. 전역 설정과 의존성 버전은 변경하지 않았습니다. 설치 과정에서 기존 ESLint 9 지원 종료 경고와 사용하지 않는 선택적 WASM 의존성 정리의 EPERM 경고가 표시됐으나 설치 및 전체 검사는 정상 종료했습니다.
