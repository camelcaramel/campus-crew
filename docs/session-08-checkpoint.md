# 8차시 — Mock 데이터로 모집글 목록 만들기

이번 차시의 핵심은 **데이터 → 반복 렌더링 → 카드 UI**입니다. `/recruitments`에서 네 개의 Mock 모집글을 표시합니다.

## 파일을 읽는 순서

1. `apps/web/src/features/recruitments/types.ts`: 객체 하나의 모양을 정의합니다.
2. `apps/web/src/app/recruitments/page.tsx`: Mock 배열과 map을 함께 읽습니다.
3. `apps/web/src/features/recruitments/recruitment-card.tsx`: 전달받은 객체가 화면에 표시되는 위치를 찾습니다.

## type: 데이터 하나의 약속

`Recruitment`는 id, category, status, title, content, author, createdAt을 명시합니다. `author.name`처럼 객체 안에 객체가 들어갈 수 있습니다.

`status: 'OPEN' | 'CLOSED'`는 두 문자열 중 하나만 허용합니다. 잘못된 상태나 빠진 필드를 작성하면 TypeScript가 알려줍니다. 타입은 개발 중 구조를 검사하는 도구이며 실제 API 응답을 실행 중에 검증하는 기능은 아닙니다.

`createdAt`에는 이번 차시에서 `2026-09-13` 형태의 날짜 문자열을 사용합니다. `time`의 `dateTime` 속성에도 같은 값을 전달합니다.

## mock data: 서버 없이 준비한 연습 데이터

페이지의 `mockRecruitments: Recruitment[]`는 Recruitment 객체의 배열입니다. 스터디/프로젝트, 모집 중/모집 마감 예시를 모두 담습니다. 실제 사람이나 서버에서 받은 데이터가 아닙니다.

별도 데이터 접근 계층 없이 페이지에서 배열의 필드와 화면을 바로 비교할 수 있습니다. API 연결은 후속 차시에서 다룹니다.

## map과 props: 객체 하나를 카드 하나로

```tsx
<ul className="mt-8 space-y-4">
  {mockRecruitments.map((recruitment) => (
    <li key={recruitment.id}>
      <RecruitmentCard recruitment={recruitment} />
    </li>
  ))}
</ul>
```

`map`은 배열의 각 객체를 받아 JSX로 바꾼 새 배열을 만듭니다. React가 그 배열을 화면에 렌더링합니다. 네 개의 객체가 네 개의 li와 카드가 됩니다.

`recruitment={recruitment}`에서 왼쪽은 자식에게 전달할 props의 이름, 오른쪽은 현재 반복 중인 객체입니다. 카드에서는 `{ recruitment }: RecruitmentCardProps`로 받아 `recruitment.title` 등을 사용합니다. 부모가 데이터를 준비하고 자식은 전달받은 값을 표시합니다.

## key: 형제 항목을 구분하는 안정적인 이름

`key={recruitment.id}`는 React가 추가·삭제·순서 변경 전후의 항목을 구분하도록 돕습니다. 반복 결과의 가장 바깥 요소인 li에 지정합니다. 같은 목록 안에서 고유하고 바뀌지 않는 데이터 id를 사용합니다.

배열 index는 항목의 순서가 바뀌면 다른 데이터를 가리킬 수 있습니다. `key`는 React가 사용하는 특별한 값이며 일반 props처럼 자식에게 전달되지 않습니다. 카드에서 id가 필요하면 전달받은 `recruitment.id`를 읽습니다.

## Figma 카드와 React 컴포넌트

| 화면의 부분              | React/CSS 대응                 |
| ------------------------ | ------------------------------ |
| F03 제목과 부제          | page.tsx의 h1과 p              |
| 반복되는 카드 한 개      | RecruitmentCard의 article      |
| 카드 내부 여백 24px      | p-6                            |
| 모서리 12px, 테두리 1px  | rounded-xl, border             |
| 테두리 #E5E7EB           | border-neutral-200             |
| 제목 #111827             | text-neutral-900               |
| 설명·작성자·날짜 #6B7280 | text-neutral-500               |
| 카테고리와 상태          | 간단한 span badge              |
| 모집 중 / 모집 마감      | status에 따른 색상과 한글 문구 |
| 본문 최대 폭 1120px      | 기존 RootLayout의 Container    |

`content`는 `line-clamp-2`로 최대 두 줄까지 표시합니다. 원래 문자열을 잘라 저장하지 않으므로 화면 폭에 따라 요약되는 길이가 달라집니다.

기존 Header와 Container는 layout.tsx를 통해 재사용합니다. 페이지 안에 다시 추가하지 않습니다. 상세 링크는 9차시로 미루어 없는 상세 페이지로 이동하는 문제를 피합니다. 검색·필터·작성·페이지네이션 UI는 이번 핵심 흐름에 집중하기 위해 추가하지 않았습니다.

## 학생 실습

1. 첫 번째 객체의 title을 바꾸고 저장해 같은 카드의 제목이 바뀌는지 확인합니다.
2. 한 객체의 status를 OPEN에서 CLOSED로 바꾸고 문구와 색상이 함께 바뀌는지 확인합니다.
3. 고유한 id를 가진 객체를 배열에 추가해 JSX를 복사하지 않아도 카드가 늘어나는지 확인합니다.
4. 배열의 순서를 바꾸고 화면의 카드 순서를 비교합니다.
5. 카드의 p-6을 찾아 Figma의 내부 여백과 연결해 설명합니다.

React에서는 데이터에 맞춰 UI를 선언합니다. 이 예제에서는 소스의 Mock 배열을 수정하고 다시 렌더링할 때 화면도 바뀝니다. 임의의 변수 변경이 항상 재렌더링을 일으키는 것은 아니며, 사용자 입력에 따른 state 변경은 후속 차시에서 다룹니다.

## 실행과 검사

새 8차시 worktree의 루트에서 실행합니다.

```bash
npm ci
npm run dev:web
```

브라우저에서 `http://localhost:3000/recruitments`를 엽니다.

```bash
npm run format:check
npm run lint
npm run build
git diff --check
```

lint와 build는 기존 npm workspace 설정에 따라 web과 API를 모두 검사합니다. 이번 정적 UI를 위해 테스트 프레임워크나 의존성을 추가하지 않았습니다.

## 이전 차시와 비교

| 차시 | 브랜치                                | 기준 커밋                  |
| ---- | ------------------------------------- | -------------------------- |
| 4    | main                                  | 8332381                    |
| 5    | chore/session-05-dev-environment      | f6c4e44                    |
| 6    | feat/session-06-next-app-router       | ceb4583                    |
| 7    | feat/session-07-shared-layout         | 096900d                    |
| 8    | feat/session-08-recruitment-list-mock | 7차시에서 분기한 별도 커밋 |

```bash
git diff feat/session-07-shared-layout..feat/session-08-recruitment-list-mock -- apps/web/src
```

8차시 worktree는 이전 차시와 Git 기록을 공유하므로 폴더를 임의로 이동하지 않습니다. 기존 차시를 보려면 각 차시의 보존된 worktree를 사용합니다.

## 실제 검증 기록

실행일: 2026-09-13. Windows, Node.js 22.17.1, npm 10.9.2.

| 검사         | 결과                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| 설치         | `npm ci --offline --no-audit --no-fund`, 610개 패키지 설치, 종료 코드 0                            |
| 변경 전 기준 | 7차시 코드에서 `npm run check`, format:check / API·web lint / API·web build 모두 통과              |
| 변경 후 검사 | 8차시 코드에서 `npm run check`, format:check / API·web lint / API·web build 모두 통과, 종료 코드 0 |
| 정적 라우트  | `/`, `/recruitments` 빌드 성공                                                                     |
| 실행 확인    | `node node_modules/next/dist/bin/next start apps/web --hostname 127.0.0.1 --port 3108`             |
| HTTP         | `/`, `/recruitments` 각각 200, 목록 응답에 article 4개와 header 1개                                |
| 1440px 화면  | Header 높이 64px, 본문 폭 1120px, 카드 padding 24px, radius 12px, border 1px                       |
| 색상         | 테두리 #E5E7EB, 제목 #111827, 보조 텍스트 #6B7280. 모집 중 green, 모집 마감 gray 및 문구 확인      |
| 390px 화면   | 카드와 제목 줄바꿈 정상, 가로 넘침 없음, content 최대 두 줄과 말줄임 확인                          |
| 데이터       | Mock 카드 4개, 모집 중 3개/모집 마감 1개, 작성자와 YYYY-MM-DD 날짜 및 datetime 속성 확인           |
| 이동 및 콘솔 | 기존 로고로 홈 이동, 모집글 메뉴로 목록 복귀 정상. 브라우저 warning/error 없음                     |
| 코드 리뷰    | 런타임 결함 없음. 문서의 map 예제를 완전한 ul JSX로 보완                                           |
| 보존         | 4~7차시 HEAD 8332381/f6c4e44/ceb4583/096900d 유지, 각 worktree clean                               |
| 변경 범위    | 코드 3개 및 문서 2개. 공통 레이아웃, 홈, API, package/lockfile, 5차시 설정 변경 없음               |

검증용 서버와 탭을 종료하고 임시 viewport 설정을 복원했습니다. 문서 보완 후 format:check와 git diff --check를 다시 실행했습니다.

실행 환경에서는 현재 프로세스에만 `npm_config_prefix=C:\Program Files\nodejs`와 기존 4차시 `work/npm-cache`를 적용했습니다. 전역 설정은 변경하지 않았습니다. 설치 중 기존 ESLint 9 지원 종료 경고가 있었으나 설치와 검사는 모두 성공했습니다. Git의 사용자 전역 ignore 파일 읽기 권한 경고가 있었으며, 저장소 자체의 상태/차이 검사는 정상 수행됐습니다.
