# Campus Crew

TypeScript 풀스택 30차시 수업의 **4차시 checkpoint**입니다. 하나의 저장소에 Next.js 웹과 NestJS API를 두고, npm workspaces로 설치·실행합니다.

## 4차시 목표

- 프로젝트 루트와 두 앱의 역할을 구분합니다.
- 개발 서버 두 개를 실행하고 브라우저에서 응답을 확인합니다.
- TypeScript, ESLint, Prettier, build의 역할을 설명합니다.

현재는 web의 시작 화면과 api의 시작 응답만 구현되어 있습니다. 로그인, 데이터베이스, 모집 CRUD, web에서 API 호출하기, Figma 화면 구현은 후속 차시에서 진행합니다.

## 준비

- Node.js **22.17.1 이상**: 수업에서는 Node.js 22 LTS 계열을 사용합니다.
- npm **10 이상**: checkpoint 작성 시 npm 10.9.2로 검증합니다.
- Git, 코드 편집기, 터미널 두 개.

```bash
node --version
npm --version
```

전역 Next.js/Nest CLI 설치, Docker, 환경 변수 파일은 필요하지 않습니다. 패키지 최초 설치에는 인터넷 연결이 필요합니다.

## 설치와 실행

터미널에서 이 `README.md`와 루트 `package.json`이 있는 `campus-crew` 폴더로 이동합니다.

```bash
npm ci
```

`npm ci`는 함께 제공한 `package-lock.json`대로 설치합니다. 패키지를 의도적으로 추가·변경할 때만 `npm install`을 사용하고 lockfile도 함께 커밋합니다. 각 앱 폴더에서 별도 설치할 필요가 없습니다.

터미널 1 — web:

```bash
npm run dev:web
```

[http://localhost:3000](http://localhost:3000)에서 `Campus Crew`와 4차시 시작 화면을 확인합니다.

터미널 2 — api:

```bash
npm run dev:api
```

[http://localhost:4000](http://localhost:4000)에서 아래 JSON을 확인합니다.

```json
{ "message": "Campus Crew API is running" }
```

web은 API가 꺼져 있어도 동작합니다. 두 서버를 종료하려면 각각의 터미널에서 `Ctrl+C`를 누릅니다. Windows에서 일괄 작업 종료 여부를 물으면 `Y`를 입력합니다.

`dev`는 파일 변경을 감지하므로, 개발 중에는 서버를 매번 다시 시작하지 않아도 됩니다. web은 Next.js Fast Refresh, api는 Nest watch 모드를 사용합니다.

## 명령 모음

모든 명령은 프로젝트 루트에서 실행합니다.

| 명령                   | 역할                                         |
| ---------------------- | -------------------------------------------- |
| `npm ci`               | 잠금 파일 기준으로 두 앱과 공통 도구 설치    |
| `npm run dev:web`      | web 개발 서버, 3000번 포트                   |
| `npm run dev:api`      | api 개발 서버, 4000번 포트                   |
| `npm run lint`         | 두 앱의 코드 규칙 검사; 파일은 수정하지 않음 |
| `npm run build`        | 두 앱의 타입 검사와 실행용 결과물 생성       |
| `npm run format:check` | 코드와 문서의 포맷 검사                      |
| `npm run format`       | Prettier로 코드와 문서 포맷 수정             |
| `npm run start:web`    | 빌드된 web 실행, 3000번 포트                 |
| `npm run start:api`    | 빌드된 api 실행, 4000번 포트                 |

앱 하나만 검사하거나 빌드할 수도 있습니다.

```bash
npm run lint --workspace=@campus-crew/web
npm run build --workspace=@campus-crew/web
npm run lint --workspace=@campus-crew/api
npm run build --workspace=@campus-crew/api
```

`--workspace`는 어느 앱의 `package.json`에 있는 스크립트를 실행할지 지정합니다. `--workspaces`는 두 앱의 스크립트를 순서대로 실행합니다. 개발 서버는 계속 실행되므로 전체 `dev --workspaces` 대신 두 터미널에서 각각 실행합니다.

`build`는 서버를 켜지 않습니다. 개발 서버를 종료한 후 `npm run build`를 실행하고, 두 터미널에서 각각 `start:web`, `start:api`를 실행하면 빌드 결과를 확인할 수 있습니다.

## 파일 구조와 역할

```text
campus-crew/
├── apps/
│   ├── web/
│   │   ├── src/app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next-env.d.ts
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   └── eslint.config.mjs
│   └── api/
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── app.controller.ts
│       │   └── app.service.ts
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsconfig.build.json
│       ├── nest-cli.json
│       └── eslint.config.mjs
├── docs/
│   ├── session-04-checkpoint.md
│   └── superpowers/plans/2026-09-11-campus-crew-session-04-bootstrap.md
├── package.json
├── package-lock.json
├── .gitignore
├── .gitattributes
├── .prettierrc
├── .prettierignore
└── README.md
```

### 루트

| 파일                | 역할                                                           |
| ------------------- | -------------------------------------------------------------- |
| `package.json`      | `private: true`, workspace 목록, 앱 실행 명령과 공통 개발 도구 |
| `package-lock.json` | 두 앱을 포함한 의존성의 정확한 설치 버전; Git에 포함           |
| `.gitignore`        | 의존성, 빌드 결과, 비밀 설정, 로그 등을 Git에서 제외           |
| `.gitattributes`    | 운영체제가 달라도 텍스트 파일의 줄바꿈을 LF로 통일             |
| `.prettierrc`       | 들여쓰기, 따옴표 등 공통 포맷 규칙                             |
| `.prettierignore`   | 자동 생성 파일을 포맷 대상에서 제외                            |
| `docs/`             | 수업 계획, checkpoint 및 후속 설계 문서                        |

공통 개발 도구는 루트에, 실제 앱이 사용하는 라이브러리는 해당 앱의 `package.json`에 선언합니다. 공유 코드나 공통 설정 패키지는 아직 만들지 않습니다.

### web

| 파일                  | 역할                                                             |
| --------------------- | ---------------------------------------------------------------- |
| `src/app/layout.tsx`  | 전체 페이지의 HTML 틀, 한국어 언어 설정, metadata, CSS import    |
| `src/app/page.tsx`    | App Router의 `/` 주소에 표시할 페이지                            |
| `src/app/globals.css` | Tailwind CSS 로딩과 전역 스타일                                  |
| `next.config.ts`      | Next.js 설정; 수업에 불필요한 AI 지침 파일 자동 생성 비활성화    |
| `next-env.d.ts`       | Next.js가 자동 생성하는 타입 참조; 직접 수정하거나 커밋하지 않음 |
| `postcss.config.mjs`  | Tailwind CSS 4를 빌드에 연결                                     |
| `tsconfig.json`       | web TypeScript 검사 및 `@/*` → `src/*` 경로 별칭                 |
| `eslint.config.mjs`   | Next.js/React/TypeScript용 ESLint flat config                    |
| `package.json`        | Next.js/React 의존성, Tailwind 도구, web 명령                    |

Tailwind CSS 4는 `@import 'tailwindcss'`와 PostCSS 플러그인을 사용합니다. 기본 구성에서는 별도의 `tailwind.config.js`가 필요하지 않습니다. `next lint` 대신 ESLint 명령을 직접 사용합니다.

### api

| 파일                    | 역할                                                  |
| ----------------------- | ----------------------------------------------------- |
| `src/main.ts`           | Nest 앱 생성과 4000번 포트 실행, 시작 실패 기록       |
| `src/app.module.ts`     | 사용할 Controller와 Service 등록                      |
| `src/app.controller.ts` | `GET /` 요청을 받고 Service 호출                      |
| `src/app.service.ts`    | 응답 데이터 생성; 후속 차시에서 업무 로직을 배울 위치 |
| `nest-cli.json`         | 소스 위치와 Nest CLI 빌드 설정                        |
| `tsconfig.json`         | api TypeScript 및 Nest decorator 설정                 |
| `tsconfig.build.json`   | 빌드에서 테스트 파일 제외                             |
| `eslint.config.mjs`     | JavaScript/TypeScript용 ESLint flat config            |
| `package.json`          | NestJS 런타임 의존성과 api 명령                       |

요청 흐름은 `브라우저 → Controller → Service → JSON 응답`입니다. `Module`은 이 클래스들을 Nest에 등록하고, `main.ts`는 서버를 시작합니다.

## 다음 차시를 위한 위치

- `docs/`에 요구사항, API 설계, 수업 노트를 추가합니다.
- CI를 배우는 차시에 루트 `.github/workflows/`를 생성합니다.
- 데이터베이스·Docker를 배우는 차시에 루트 `docker-compose.yml`을 추가합니다.

4차시에는 문서 외의 위 설정들을 생성하지 않습니다. 앱 구조를 바꾸지 않고 추가할 수 있습니다. Next.js 내부의 기본 번들러인 Turbopack과 별개로, monorepo 실행 도구인 Turborepo/Nx는 사용하지 않습니다.

## 확인과 문제 해결

[4차시 checkpoint](docs/session-04-checkpoint.md)의 실습 순서와 검증 기록을 확인하세요.

- `EADDRINUSE` 또는 포트 충돌: 이전에 실행한 3000/4000 서버를 해당 터미널에서 종료한 뒤 다시 실행합니다. 고정 포트를 바꾸지 않습니다.
- `next`/`nest`를 찾을 수 없음: 프로젝트 루트에서 `npm ci`를 실행합니다. 전역 CLI 설치로 해결하지 않습니다.
- `start`에서 빌드 결과를 찾지 못함: 개발 서버를 종료하고 먼저 `npm run build`를 실행합니다.
- `npm --version` 자체가 실패함: 프로젝트 이전의 Node/npm 설치 문제입니다. 실행 경로를 확인하거나 Node.js를 복구합니다. 잠금 파일 삭제는 해결책이 아닙니다.

이 PC처럼 `npm --version`에서 누락된 전역 npm 경로 오류가 나지만 `C:\Program Files\nodejs`의 npm은 설치되어 있다면, 각 PowerShell 터미널에서 아래처럼 설치된 Node.js 폴더를 임시 prefix로 지정할 수 있습니다. 새 터미널에는 적용되지 않으며 전역 설정을 저장하지 않습니다.

```powershell
$env:npm_config_prefix = Split-Path (Get-Command node).Source
npm --version
```

## 의존성 관리 메모

- 루트 `overrides`는 NestJS Express 어댑터가 사용하는 `multer`를 보안 수정 버전 `2.3.0`으로 고정합니다. [해당 보안 공지](https://github.com/advisories/GHSA-wc9g-mqfw-jrwm)에 따른 조정이며, Nest가 수정 버전을 직접 포함하면 제거 여부를 검토합니다.
- ESLint 9는 [유지보수가 종료](https://eslint.org/version-support/)되어 설치 시 경고가 표시됩니다. 이 checkpoint는 Next.js ESLint 설정에 포함된 React·접근성 플러그인의 ESLint 9 호환 범위에 맞췄습니다. ESLint 10을 공식 지원하는 플러그인 조합이 준비되면 함께 갱신합니다.

## 공식 문서

- [npm workspaces](https://docs.npmjs.com/cli/v11/using-npm/workspaces/)
- [Next.js App Router 설치](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind CSS의 Next.js 설정](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [NestJS 첫 단계](https://docs.nestjs.com/first-steps) — 공식 문서의 최신 버전과 이 checkpoint의 NestJS 11은 다를 수 있으므로 수업에서는 잠금 버전을 사용합니다.
