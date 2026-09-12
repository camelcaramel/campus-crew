# 4차시 checkpoint — 프로젝트 시작

## 이번 차시에 준비한 것

하나의 Git 저장소에서 npm workspaces로 web과 api를 설치하고 실행합니다.

- `apps/web`: Next.js App Router + TypeScript + Tailwind CSS, 3000번 포트.
- `apps/api`: NestJS + TypeScript, 4000번 포트.
- 루트: 공통 실행 명령, Prettier 규칙, 잠금 파일, Git 제외 규칙, README.

web의 시작 화면과 api의 시작 응답만 있습니다. 로그인, DB, 모집 기능, Figma 화면, web→api 호출은 후속 차시 범위입니다. `.github/workflows/`와 루트 `docker-compose.yml`은 해당 내용을 배우는 차시에 추가합니다.

## 학생 실습 순서

1. `README.md`가 있는 프로젝트 루트를 편집기에서 엽니다.
2. `node --version`, `npm --version`으로 설치 환경을 확인합니다.
3. 루트에서 `npm ci`를 실행합니다.
4. 첫 번째 터미널에서 `npm run dev:web`를 실행합니다.
5. 두 번째 터미널에서 `npm run dev:api`를 실행합니다.
6. 브라우저에서 [web](http://localhost:3000)과 [api](http://localhost:4000)를 각각 확인합니다.
7. `apps/web/src/app/page.tsx`의 안내 문장을 바꾸고 화면 변경을 확인합니다.
8. `apps/api/src/app.service.ts`의 `message`를 바꾸고 API를 새로고침하여 변경을 확인합니다.
9. 실습 문구를 원래대로 돌려놓고 서버를 종료합니다.
10. 아래 검사 명령을 실행합니다.

```bash
npm run format:check
npm run lint
npm run build
```

포맷 검사만 실패하면 `npm run format`으로 정리한 후 다시 검사합니다. lint는 코드 규칙을, build는 타입과 빌드 구성을 확인합니다.

빌드 결과를 실행하려면 개발 서버를 종료한 상태에서 두 터미널에 각각 아래 명령을 입력합니다.

```bash
npm run start:web
```

```bash
npm run start:api
```

## 학생 완료 체크리스트

- [ ] 루트의 `workspaces: ["apps/*"]`가 두 앱을 묶는다는 것을 설명할 수 있다.
- [ ] 루트와 각 앱의 `package.json` 역할을 구분할 수 있다.
- [ ] web 3000에서 `Campus Crew` 시작 화면이 보인다.
- [ ] api 4000에서 아래 JSON이 보인다.
- [ ] 두 앱의 코드를 수정하면 개발 서버가 변경을 반영한다.
- [ ] format 검사, lint, build가 통과한다.
- [ ] `layout.tsx`와 `page.tsx`의 역할을 설명할 수 있다.
- [ ] `main.ts → Module → Controller → Service`의 관계를 설명할 수 있다.
- [ ] `package-lock.json`은 커밋하고, `node_modules`, `.next`, `dist`, 환경 변수의 비밀 값은 커밋하지 않는다.
- [ ] 두 서버를 종료할 수 있다.

```json
{ "message": "Campus Crew API is running" }
```

## 제작 시 검증 기록

계획 작성: **2026-09-11**. 실행 검증: **2026-09-11~12**, Windows / Node.js **22.17.1** / npm **10.9.2**.

| 항목                              | 확인 결과                                                                |
| --------------------------------- | ------------------------------------------------------------------------ |
| 루트 `npm ci`                     | 성공, 단일 lockfile로 두 workspace 설치                                  |
| 루트 `npm run lint`               | web/api 모두 종료 코드 0                                                 |
| 루트 `npm run build`              | web/api 모두 종료 코드 0, `.next` 및 `dist/main.js` 생성                 |
| `npm run dev:web`                 | 3000에서 HTTP 200, 한국어 HTML과 Campus Crew 제목 확인                   |
| `npm run dev:api`                 | 4000에서 HTTP 200, 예상 JSON과 Content-Type 확인                         |
| Tailwind CSS                      | 개발/빌드 서버가 제공한 CSS에서 `text-4xl`, `min-h-screen` 유틸리티 확인 |
| web 개발 변경 반영                | 안내 문장 변경 후 새 HTTP 응답에서 변경 확인                             |
| api 개발 변경 반영                | **검증 미완료** — 아래 Windows 실행 환경 제한 참조                       |
| 원본 복원                         | 임시 변경을 원복하고 원본 소스 및 시작 응답 확인                         |
| `npm run start:web` / `start:api` | 빌드 결과 실행 후 두 포트에서 HTTP 200 및 예상 내용 확인                 |
| 의존성 보안 검사                  | `multer` 수정 버전 적용 후 `npm audit` 취약점 0건 (2026-09-11 기준)      |
| 별도 코드 리뷰                    | 구조·스크립트·설정·문서에서 수정이 필요한 문제 없음                      |

검증 중 시작한 서버는 종료했습니다. 초기 화면의 HTTP/CSS 확인까지 수행했으며, Figma 시각 일치 검사나 제품 기능 테스트는 이번 범위에 포함하지 않았습니다.

추가 최종 검사: 루트 `npm run format:check`와 `git diff --cached --check` 모두 종료 코드 0으로 통과했습니다.

### 이 실행 환경에서 확인한 제한

**API 자동 재시작:** Nest CLI가 Windows에서 변경 감지 후 기존 프로세스를 종료할 때 사용하는 `taskkill /T /F`가 제한된 실행 환경에서 `Access is denied`로 실패했습니다. 최초 컴파일과 Nest 서버의 시작·HTTP 응답은 성공했습니다. 이 결과만으로 일반 Windows 터미널에서의 자동 재시작 성공을 주장하지 않습니다. 수업 시작 전 일반 PowerShell/터미널에서 위 실습 8번을 확인해야 합니다. Nest 표준 `nest start --watch` 설정은 유지했습니다.

**npm 실행 경로:** 이 PC의 기존 전역 npm 경로가 누락된 파일을 가리켰습니다. 설치된 npm 10.9.2 자체는 정상으로, 검증 시에만 prefix/cache를 작업용 폴더로 지정했습니다. 시스템 설치와 전역 설정은 변경하지 않았습니다. 같은 오류가 나면 README의 PowerShell 임시 조치 또는 Node.js 설치 복구 안내를 따릅니다.

**설치 경고:** ESLint 9 지원 종료 경고는 Next.js 플러그인의 호환 범위 때문에 남아 있습니다. 상세 이유와 `multer` override의 근거는 [README](../README.md#의존성-관리-메모)에 있습니다.

## 다음 차시로 넘어가기 전

학생 완료 체크리스트를 자신의 PC에서 확인합니다. 특히 API 자동 재시작은 제작 환경에서 검증을 마치지 못했으므로 수업 환경에서 확인해야 합니다. 이후 이 구조를 유지하면서 Figma 화면을 컴포넌트로 나누고 필요한 데이터/API를 구현합니다.
