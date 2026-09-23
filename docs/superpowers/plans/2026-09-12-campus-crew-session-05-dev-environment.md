# Campus Crew Session 05 Development Environment Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkboxes for tracking.

**Goal:** 4차시 코드를 보존하면서 학생이 동일한 규칙과 환경으로 개발하고 루트에서 검사할 수 있게 한다.

**Architecture:** 기존 npm workspaces와 앱별 ESLint flat config를 유지한다. Prettier는 루트 설정 하나를 사용한다. Next.js는 앱 루트의 .env.local을 기본 방식으로 읽고, NestJS는 Node.js 내장 API로 앱 루트의 선택적 .env를 읽는다.

**Tech Stack:** 기존 잠금 버전 Next.js 16.3.4 / NestJS 11.2.3 / TypeScript 5.9.3 / ESLint 9.39.5 / Prettier 3.9.6 / Node.js 22.17.1 / npm 10.9.2.

**Spec:** 2026-09-12 사용자 요청의 5차시 범위와 기존 docs/session-04-checkpoint.md.

## Global Constraints

- 원본 저장소: main, 83323814db60b1ef3fe41a2694e8ca7acdb54df7. 시작 시 git status가 깨끗함.
- 작업 브랜치: chore/session-05-dev-environment. 원본 밖의 outputs/campus-crew-session-05에 연결 worktree 생성 완료.
- 원본 .gitignore까지 수정하지 않기 위해 프로젝트 내부 .worktrees 대신 이번 작업의 출력 폴더를 사용한다.
- 기존 커밋 수정, reset --hard, clean -fd, push --force, 기존 작업 덮어쓰기 금지.
- 의존성 버전 및 lockfile, Next/Nest 기본 빌드·lint 구성 유지. Turborepo/Nx 및 추가 설정 라이브러리 도입 금지.
- 실제 환경 파일은 커밋하지 않는다. .env.example에는 비밀이 아닌 로컬 예제만 담는다.
- 빈 폴더용 .gitkeep 대신 각 폴더에 실제 역할과 배치 예시가 있는 README만 둔다.
- 제품 기능·DB·API 클라이언트를 미리 구현하지 않는다. 기존 시작 화면과 API 응답을 유지한다.

## Task 1: 기준 상태와 검사 체계

**Files:** package.json, .prettierignore, apps/web/eslint.config.mjs, apps/api/eslint.config.mjs, .prettierrc (뒤 세 파일은 검토 후 유지).

- [x] 별도 worktree에서 npm ci 후 기존 format:check / lint / build 결과 기록.
- [x] 기존 format / format:check 명령을 유지하고 루트 package.json에 다음을 추가한다.

```json
"check": "npm run format:check && npm run lint && npm run build"
```

- [x] package.json 설명을 5차시 checkpoint로 변경한다.
- [x] .prettierignore에 .env*를 추가하여 로컬 환경파일을 포맷 대상에서 명시적으로 제외한다.
- [x] 기존 문서에 포맷 불일치가 있다면 새 브랜치에서만 npm run format으로 정리하고 변경 범위를 기록한다.

## Task 2: 앱별 환경변수와 디렉터리 규칙

**Files:** apps/web/.env.example, apps/api/.env.example, apps/api/src/main.ts, apps/web/src/{components,features,lib}/README.md, apps/api/src/{common,modules,prisma}/README.md.

- [x] 소스 수정 전에 별도 검증 스크립트로 PORT 지정 시 기존 서버가 지정 포트에 응답하지 않는 것을 확인한다.
- [x] web 예제에는 NEXT_PUBLIC_API_BASE_URL=http://localhost:4000, api 예제에는 PORT=4000만 추가한다. 주석에 각각 복사 대상 .env.local / .env를 설명한다.
- [x] main.ts의 bootstrap 안에서 앱 루트의 .env가 있으면 Node.js loadEnvFile로 읽는다. 위치는 resolve(__dirname, '../.env')로 고정한다. 실행 위치에 의존하지 않게 한다.
- [x] API 포트는 Number(process.env.PORT ?? 4000)으로 읽고 정수 1~65535가 아니면 명확한 오류로 시작을 중단한다. 기존 환경변수가 파일보다 우선한다.
- [x] 각 README는 해당 폴더의 역할, 들어갈 파일 예시, 지금은 미구현인 경계를 설명한다. 기존 App Router / Controller / Service / Module 위치는 유지한다.
- [x] 실제 HTTP 확인: .env 없음→4000, 파일 PORT→다른 포트, 외부 PORT→파일보다 우선, 잘못된 PORT→실패. 검증용 파일은 검증 스크립트가 만든 것만 제거한다.
- [x] Next.js 기본 환경 로더로 web 예제 복사 후 값이 읽히는지 확인한다. 실제 API 호출 구현은 하지 않는다.
- [x] git check-ignore로 루트·web·api의 .env/.env.local 등은 제외되고 앱별 .env.example은 추적 가능한지 확인한다.

## Task 3: 학생 안내와 최종 검증·커밋

**Files:** README.md, docs/session-05-checkpoint.md, 이 계획서.

- [x] README에 5차시 목표, 앱별 환경 파일 위치, 안전한 복사법, NEXT_PUBLIC 공개/빌드 시 고정 특성, PORT 기본값·우선순위·재시작 방법, 폴더 구조, check 명령을 추가한다.
- [x] 4차시 checkpoint 내용은 그대로 유지한다. 포맷 변경은 허용하되 의미 변경은 하지 않는다.
- [x] docs/session-05-checkpoint.md에 실습 순서, Issue→Branch→Coding→실행→diff→Commit→PR 흐름, 완료 조건, 실제 검증 결과와 환경 제한을 작성한다.
- [x] npm run format 후 npm run check로 두 앱의 format/lint/build를 모두 검증한다.
- [x] diff를 검토하고 별도 코드 리뷰로 범위, 실행, 환경파일 제외, 원본 보존을 확인한다.
- [x] git diff --check, git status, 원본 main SHA/작업트리, lockfile 불변, 4차시 commit ancestry를 확인한다.
- [x] 정확한 변경 파일만 stage 후 chore: configure development environment로 새 커밋한다. push/merge하지 않는다.
- [x] 최종 브랜치·worktree 경로·커밋·변경파일·명령·결과·원본 보존 방법을 요약한다.

## Execution log

- 2026-09-12: 원본의 status / branch / log / worktree 정보를 읽고 main 8332381과 clean 상태를 확인했다. remote는 등록되어 있지 않다.
- 새 worktree는 원본 8332381에서 분기했다. 기존 파일 및 커밋은 수정하지 않았다.
- 이 PC의 npm 기본 prefix는 누락된 전역 npm 경로를 가리킨다. 실행 프로세스에서만 npm_config_prefix를 설치된 Node.js 폴더로 지정하고 기존 로컬 npm 캐시로 설치한다. 시스템 설정은 수정하지 않는다.

- 실행 완료: 기준 검사와 최종 npm run check가 통과했다. API 환경 동작 9종, Next.js 환경 로더, Git 제외 규칙을 확인했다.
- 코드 리뷰: 중요 문제 없음. dev:api 설명의 포트를 실제 PORT 동작에 맞춰 수정했다.
- 기존 4차시 문서와 화면, 잠금 파일에는 변경이 없다. 새 커밋과 작업공간을 유지하는 것으로 마무리한다.
