# Campus Crew Session 04 Bootstrap Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to execute this plan task-by-task in this session. Track progress with checkboxes. The user has authorized implementation and requested a single initial commit.

**Goal:** npm workspaces로 Next.js web과 NestJS api를 구성하고, 4차시 종료 시 설치·정적 검사·빌드·개발 서버 실행을 재현할 수 있게 한다.

**Architecture:** 루트는 workspace 실행 명령, 잠금 파일, 공통 포맷을 관리한다. `apps/web`과 `apps/api`는 별도의 TypeScript·ESLint·빌드 설정을 갖고 각각 3000과 4000에서 실행한다. 새 프로젝트 전용 디렉터리에 독립 Git 저장소를 만들며 기존 저장소는 없다.

**Tech Stack:** Node.js 22, npm 10 workspaces, Next.js 16 / React 19 / Tailwind CSS 4, NestJS 11, TypeScript 5, ESLint 9, Prettier 3. 설치 전에 호환 패치 버전을 확인하고 직접 의존성과 루트 lockfile에 고정한다.

**Spec:** 이 문서의 범위와 전역 제약은 2026-09-11 사용자가 지정한 4차시 구현 요구사항이다. 추가 제품 설계나 Figma 화면 구현은 포함하지 않는다.

## Global Constraints

- `apps/web`: Next.js App Router + TypeScript + Tailwind CSS.
- `apps/api`: NestJS + TypeScript.
- 개발 포트: web 3000, api 4000. 시작 시에도 같은 포트를 쓴다.
- npm workspaces만 사용한다. Turborepo/Nx 및 별도 동시 실행 도구를 추가하지 않는다.
- 루트 필수 파일: `package.json`, `.gitignore`, `.prettierrc`, `README.md`.
- 루트 잠금 파일 하나로 설치한다. workspace별 lockfile과 중첩 `.git`은 만들지 않는다.
- `docs/`에는 계획과 checkpoint를 둔다. `.github/` 및 루트 `docker-compose.yml`의 향후 위치는 README로 안내하며 빈 CI/Docker 설정을 실행 가능한 것처럼 추가하지 않는다.
- 학생용 최소 시작 코드만 둔다. 로그인·DB·모집 CRUD·실제 API 연동·Figma 완성 화면은 후속 차시 범위다.
- 공통 tsconfig 패키지나 별도 공유 패키지를 미리 만들지 않는다.
- 검증 후 권한과 Git 상태가 허용되면 `chore: initialize campus crew monorepo` 한 개만 커밋한다. 푸시하지 않는다.

## Task 1: 루트 및 workspace 설정

**Files:** `package.json`, `package-lock.json`, `.gitignore`, `.prettierrc`, `.prettierignore`, `.gitattributes`, `apps/web/package.json`, `apps/api/package.json`.

**Interfaces:** 루트는 아래 명령을 각 workspace로 전달한다. 공통 도구는 루트에서 설치하고 앱 런타임 의존성은 각 앱에 선언한다.

```json
{
  "private": true,
  "workspaces": ["apps/*"],
  "scripts": {
    "dev:web": "npm run dev --workspace=@campus-crew/web",
    "dev:api": "npm run dev --workspace=@campus-crew/api",
    "build": "npm run build --workspaces",
    "lint": "npm run lint --workspaces",
    "start:web": "npm run start --workspace=@campus-crew/web",
    "start:api": "npm run start --workspace=@campus-crew/api",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

- [x] 패키지 메타데이터로 호환 버전을 확인한다. Node.js와 npm 실행 환경을 기록한다.
- [x] 루트와 앱 manifest를 작성한다. `.gitignore`에 `node_modules/`, `.next/`, `dist/`, `coverage/`, `.env*`(단 `.env.example` 제외), 로그 및 `*.tsbuildinfo`를 넣는다.
- [x] Prettier는 작은따옴표, 세미콜론, 2칸 들여쓰기, LF를 사용한다. 생성물은 포맷 대상에서 제외한다.
- [x] 루트에서 `npm install`을 실행하고 workspace 링크와 단일 lockfile을 확인한다.

## Task 2: web 시작 화면

**Files:** `apps/web/tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` (모두 `apps/web/` 기준).

**Interfaces:** `GET http://localhost:3000/` → HTML 200, 제목 `Campus Crew`, 4차시 시작 안내. API가 없어도 web을 실행하고 빌드할 수 있다.

```json
{
  "dev": "next dev --port 3000",
  "build": "next build",
  "start": "next start --port 3000",
  "lint": "eslint . --max-warnings 0"
}
```

```css
@import 'tailwindcss';
```

- [x] strict TypeScript와 App Router용 설정, Next ESLint flat config 및 Tailwind PostCSS 플러그인을 추가한다.
- [x] `layout.tsx`에서 `lang="ko"`, metadata 및 전역 CSS를 설정한다. 외부 폰트 다운로드 없이 시스템 폰트를 쓴다.
- [x] `page.tsx`에 Campus Crew 제목과 시작 안내를 표시하고 Tailwind 유틸리티를 사용한다. 서비스 디자인으로 오해하지 않도록 부트스트랩임을 명시한다.
- [x] web lint/build를 실행하고, 최종 검증 때 실제 HTTP 응답과 CSS 제공 여부를 확인한다.

## Task 3: api 시작 응답

**Files:** `apps/api/tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `eslint.config.mjs`, `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`, `src/app.service.ts` (모두 `apps/api/` 기준).

**Interfaces:** `GET http://localhost:4000/` → HTTP 200 및 `{"message":"Campus Crew API is running"}` JSON. Controller → Service 호출, Module에 등록, main에서 서버 시작.

```json
{
  "dev": "nest start --watch",
  "build": "nest build",
  "start": "node dist/main.js",
  "lint": "eslint . --max-warnings 0"
}
```

```typescript
const app = await NestFactory.create(AppModule);
await app.listen(4000);
```

- [x] Nest CLI 설정, strict TypeScript, decorator metadata, ESLint flat config를 작성한다.
- [x] Module/Controller/Service의 역할을 분리한 최소 시작 코드를 작성한다. bootstrap 오류는 로그를 남기고 비정상 종료한다.
- [x] api lint/build를 실행하고 `dist/main.js` 생성 경로를 확인한다.

## Task 4: 수업 문서 및 실행 검증

**Files:** `README.md`, `docs/session-04-checkpoint.md`, 이 계획 파일의 체크박스 및 실행 기록.

**Verification approach:** 이번 변경은 프레임워크 초기 설정이다. 설정을 그대로 복제하는 단위 테스트나 테스트 프레임워크를 추가하지 않고 실제 설치, 정적 검사, 빌드, HTTP 응답, 변경 반영을 검증한다. 임시 검증 도구와 로그는 저장소 밖 작업 디렉터리에 둔다.

- [x] 한국어 README에 prerequisites, 파일 역할, 설치, 두 터미널에서 실행하는 방법, 포트, 전체/개별 명령, 후속 구조를 설명한다.
- [x] `npm ci`, `npm run format:check`, `npm run lint`, `npm run build`를 루트에서 실행한다. 모든 명령은 종료 코드 0이어야 한다.
- [x] 포트가 비어 있는지 확인한 후 루트 `npm run dev:web`, `npm run dev:api`를 실행한다. 각각 HTTP 200과 예상 응답을 확인한다. web의 CSS가 실제 제공되는지 확인한다.
- [ ] web 안내와 api 응답을 잠깐 변경하여 dev 변경 반영을 확인한 뒤 원복한다. 본 작업에서 시작한 서버만 종료한다. **부분 완료:** web 변경 반영·원복·서버 종료는 확인했으나 API watch는 Windows 프로세스 종료 접근 거부로 검증 미완료. 일반 수업 터미널에서 재확인한다.
- [x] build 결과로 `npm run start:web`, `npm run start:api`를 실행하여 같은 HTTP 응답을 확인하고 종료한다.
- [x] 학생 체크리스트와 실제 검증 결과(버전, 명령, 응답, 알려진 환경 제약)를 checkpoint에 기록한다.
- [x] 파일 범위와 생성물 제외, 문서/스크립트 일치를 최종 검토하고 새 Git 저장소와 초기 커밋을 준비한다. API watch의 미검증 항목은 checkpoint에 공개한다. 실제 커밋 결과는 `git log -1 --oneline`으로 확인한다.

## Execution notes

- 시작 상태: 대상 디렉터리에 기존 프로젝트 및 Git 저장소 없음. Node.js `22.17.1`, Git `2.50.1.windows.1` 사용 가능.
- 시스템 npm 래퍼가 사용자 전역 npm의 누락된 파일을 참조한다. 설치된 npm CLI `10.9.2`는 정상이다. 작업 중에만 npm prefix/cache를 쓰기 허용된 작업 디렉터리로 지정하여 기존 시스템 설치를 수정하지 않는다.
- 최종 결과: `docs/session-04-checkpoint.md`에 기록. 루트 재설치, lint, build, format 검사, 개발·빌드 서버 HTTP 응답 및 Tailwind CSS 확인. API watch 자동 재시작만 실행 환경의 접근 제한으로 검증 미완료.
- 의존성 조정: Nest Express 어댑터의 multer를 2.3.0으로 override하고 lockfile을 갱신하여 npm audit 0건 확인. ESLint 9는 Next 플러그인 peer 범위에 따라 유지하며 지원 종료 경고를 문서화.
- Next.js 16.3의 자동 AI 지침 파일 생성을 agentRules: false로 비활성화. next-env.d.ts는 자동 생성 파일로 Git 제외. 문서와 설정을 함께 반영.
- 코드 리뷰 결과: 수정이 필요한 구조·설정 문제 없음. 2026-09-12 최종 실행 검증과 문서 정리 수행.
