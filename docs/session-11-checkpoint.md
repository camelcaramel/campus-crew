# 11차시 — Loading / Empty / Error와 최소 공통 UI

## 실행과 상태 전환

11차시 worktree 루트에서 실행합니다. 5차시의 명령과 설정을 그대로 사용합니다.

```bash
npm ci
npm run dev:web
```

| 주소                                              | 화면                            |
| ------------------------------------------------- | ------------------------------- |
| `http://localhost:3000/recruitments`              | 기존 Mock 모집글 4개            |
| `http://localhost:3000/recruitments?mode=data`    | 동일한 Mock 목록                |
| `http://localhost:3000/recruitments?mode=loading` | Spinner + 불러오는 중 문구      |
| `http://localhost:3000/recruitments?mode=empty`   | 빈 목록 안내 + 모집글 작성 링크 |
| `http://localhost:3000/recruitments?mode=error`   | 문제 안내 + 비활성 재시도 버튼  |

주소창의 mode를 바꾸고 Enter를 누르면 상태를 확인할 수 있습니다. 미지원 값이나 중복 mode는 기본 목록을 표시합니다. 페이지는 Server Component를 유지하며 `await searchParams`로 주소의 값을 읽습니다. client state나 화면 내 디버그 패널은 필요하지 않습니다.

`mode`는 수업 시연용입니다. loading은 시간이 지나도 자동 완료되지 않습니다. 오류 화면의 `다시 시도 (준비 중)` 버튼도 의도적으로 비활성입니다. 실제 API 호출이나 네트워크 재시도는 구현하지 않았습니다.

## 1. 데이터가 있는 화면만으로는 충분하지 않다

실제 서비스에서 요청은 시간이 걸리고, 성공해도 결과가 없을 수 있으며, 실패할 수도 있습니다.

| 상태    | 의미                                | 이번 화면                          |
| ------- | ----------------------------------- | ---------------------------------- |
| Loading | 결과를 기다리는 중                  | 회전 indicator와 읽을 수 있는 안내 |
| Error   | 요청을 처리하지 못함                | 문제 문구와 재시도 자리            |
| Empty   | 정상적으로 확인했지만 데이터가 없음 | 빈 목록 안내와 작성 링크           |
| Data    | 표시할 데이터가 있음                | 기존 RecruitmentCard 목록          |

Loading의 텍스트는 화면이 멈춘 것이 아니라 대기 중임을 알립니다. `role="status"`를 사용하며, 장식용 원에는 `aria-hidden`을 지정합니다. `motion-safe:animate-spin`은 사용자가 애니메이션 감소를 요청하면 회전을 생략합니다.

## 2. UI state는 조건에 따라 선택되는 화면 분기다

페이지에서 loading → error → 빈 배열 → data 순으로 `if / else if / else` 분기를 선택합니다. 결과를 content에 넣고 공통 제목/부제 아래에서 한 번만 렌더링합니다. 따라서 대기 중이라는 이유로 빈 목록 문구까지 동시에 나타나지 않습니다.

```tsx
const { mode } = await searchParams;
const recruitments = mode === 'empty' ? [] : mockRecruitments;
```

empty 시연에서는 새 빈 배열을 사용합니다. 기존 Mock 배열을 삭제하거나 변경하지 않으므로 상세 페이지와 기본 목록은 그대로 유지됩니다. data 분기에는 기존 `map`, `key={recruitment.id}`, `RecruitmentCard` 구조가 남아 있습니다.

제목과 부제는 분기 바깥에 있고, 내용 영역은 최소 높이 320px를 확보합니다. 세 안내 화면도 같은 최소 높이를 사용합니다. 긴 목록 전체와 높이가 항상 같다는 뜻은 아니며, 짧은 안내가 나올 때 영역이 완전히 접히는 것을 방지합니다.

## 3. 반복해서 필요해진 UI만 작게 분리한다

| 파일                                           | 역할과 props                                                          |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `apps/web/src/components/ui/spinner.tsx`       | 불러오는 중 표시. `label?: string`                                    |
| `apps/web/src/components/ui/empty-state.tsx`   | 빈 상태 문구와 선택적 action. `message: string`, `action?: ReactNode` |
| `apps/web/src/components/ui/error-message.tsx` | 오류 문구와 선택적 action. `message: string`, `action?: ReactNode`    |
| `apps/web/src/app/recruitments/page.tsx`       | mode 읽기, 상태 분기, 도메인 문구와 action 전달                       |

공통 UI는 데이터를 요청하지 않고, 모집글 타입을 알 필요도 없습니다. EmptyState의 문구와 작성 링크는 page에서 전달합니다. ErrorMessage도 page가 전달한 action을 보여주므로 나중에 실제 재시도 버튼을 넣을 수 있습니다. 재시도 이벤트가 필요한 시점에 해당 버튼에 작은 Client Component 경계를 둡니다.

버튼 시스템, 상태 머신, 범용 skeleton framework를 만들지 않습니다. Header와 Container는 기존 RootLayout에서 제공하므로 페이지에 중복으로 넣지 않습니다.

## 4. Empty와 Error는 다르다

Empty는 실패가 아닙니다. 이번에는 전체 모집글이 없으므로 `아직 등록된 모집글이 없습니다. 첫 번째 모집글을 작성해보세요.`를 표시합니다. 나중에는 검색 결과 없음, 내 작성글 없음처럼 같은 빈 배열도 맥락에 따라 안내와 action이 달라질 수 있습니다. `message`와 `action`을 props로 받으면 EmptyState를 복잡하게 바꾸지 않고 재사용할 수 있습니다. 검색 기능 자체는 이번에 추가하지 않습니다.

Error는 요청을 처리하지 못한 상태입니다. `요청을 처리하는 중 문제가 발생했습니다.`를 읽을 수 있는 텍스트로 알리고 `role="alert"`를 사용합니다. 색상만으로 오류를 표현하지 않습니다. 비활성 버튼은 실제 복구가 구현됐다는 오해를 피하도록 준비 중이라고 표시합니다.

## 5. 이후 TanStack Query와 연결할 위치

| 이번 수동 조건              | 이후 연결할 값                         |
| --------------------------- | -------------------------------------- |
| `mode === 'loading'`        | `isLoading`                            |
| `mode === 'error'`          | `isError`                              |
| `recruitments.length === 0` | 성공한 `data` 배열의 길이가 0인지 확인 |
| `recruitments.map(...)`     | 성공한 `data.map(...)`                 |
| 비활성 retry 자리           | 실제 재요청을 호출하는 버튼            |

먼저 loading과 error를 확인한 뒤 성공한 data의 존재와 길이를 확인합니다. 아직 결과가 없는 대기 상태를 성공한 빈 배열로 오해하지 않아야 합니다. 이번에는 TanStack Query를 설치하거나 이 코드를 미리 구현하지 않습니다.

## 학생 확인 과제

1. 네 가지 mode를 직접 열고 각 화면의 의미를 설명합니다.
2. loading 화면에 Empty 문구가 함께 표시되지 않는 이유를 찾습니다.
3. Empty의 작성 링크로 이동해 10차시 폼이 유지되는지 확인합니다.
4. 기본 목록에서 첫 모집글을 눌러 9차시 상세 화면을 확인합니다.
5. 다른 맥락의 Empty 문구를 쓰려면 어떤 props를 바꾸면 되는지 설명합니다.
6. 향후 isLoading, isError, data가 현재 분기의 어디로 들어갈지 짚어봅니다.

## 검증 명령

```bash
npm run format:check
npm run lint
npm run build
git diff --check
```

`npm run check`는 앞의 세 npm 검사를 순서대로 실행합니다. lint와 build는 web/API workspace 모두 포함합니다.

## 실제 검증 결과

실행일: 2026-09-13. Windows, Node.js 22.17.1, npm 10.9.2.

| 검사              | 결과                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| 변경 전 baseline  | `npm run check` 종료 코드 0                                                                         |
| 구현 후 품질 검사 | format:check, web/API lint, web/API build 모두 통과. `npm run check` 종료 코드 0                    |
| 상태 분기         | 기본/data에서 카드 4개, loading/empty/error에서 카드 0개 및 각각 지정된 안내 표시                   |
| 잘못된 mode       | 미지원 값 및 `mode=empty&mode=error` 중복 값에서 기존 목록 4개 표시                                 |
| 기존 동작         | 목록 첫 카드 → 상세 1, Empty 작성 링크 → 작성 폼, 빈 등록 시 기존 세 필드 오류 표시                 |
| HTTP              | 홈·목록·네 mode·작성·상세 1~4는 200, 상세 999/abc는 404                                             |
| 레이아웃          | 데스크톱 화면 확인, 390px 폭에서 상태 화면 가로 넘침 없음, loading/empty/error 영역 높이 각각 320px |
| 접근성            | loading status 텍스트, error alert 텍스트, retry disabled 확인. reduced-motion 대응 클래스 확인     |
| 코드 리뷰         | 별도 리뷰에서 수정이 필요한 발견 사항 없음. `git diff --check` 통과                                 |
| 보존              | 10차시 worktree는 변경 없이 HEAD `d02fe59` 유지. 이전 source 중 목록 page만 수정                    |

브라우저 검증은 production build를 `http://127.0.0.1:3011`에서 실행했습니다. 기존 Header의 좁은 화면 메뉴 줄바꿈은 그대로 유지합니다. Figma 원본 파일을 직접 비교한 것은 아니며 사용자가 제시한 디자인 기준을 구현했습니다.

`searchParams`를 읽으므로 빌드 결과의 `/recruitments`는 정적 페이지에서 요청 시 서버 렌더링되는 페이지로 바뀝니다. 이는 수동 mode 선택 때문이며 API fetch가 추가됐다는 뜻은 아닙니다.

이 환경의 npm 실행에는 아래 터미널 환경 변수만 사용했습니다. 시스템 설정, package/lockfile은 변경하지 않았습니다. 기존 10차시 캐시에서 offline 설치가 성공했습니다. 설치 시 기존 ESLint 버전의 deprecation 안내와 optional 의존성 임시 폴더 정리 EPERM 경고가 있었지만, 설치 종료 코드는 0이고 품질 검사도 통과했습니다.

```powershell
$env:npm_config_prefix = 'C:\Program Files\nodejs'
$env:npm_config_cache = 'C:\Users\v2008\Documents\Codex\2026-09-13\referenced-chatgpt-conversation-this-is-an-3\work\npm-cache'
npm ci --offline --no-audit --no-fund
npm run check
node node_modules/next/dist/bin/next start apps/web --hostname 127.0.0.1 --port 3011
```

## 작업 기준점

10차시 `d02fe59`에서 `feat/session-11-recruitment-ui-states` 브랜치와 별도 worktree를 생성했습니다. 기존 목록 page에 분기를 추가하고 공통 UI 3개와 문서 2개를 추가하는 범위입니다. 기존 Mock, 카드, 상세, 작성 폼, Header/Container, package/lockfile, 5차시 설정은 보존합니다.

커밋 메시지는 `feat: add recruitment ui states`입니다. worktree는 원본 저장소의 Git 기록을 공유하므로 폴더를 임의로 이동하지 않습니다.
