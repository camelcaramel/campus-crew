# 5차시 checkpoint — 개발 환경 통일하기

## 이번 차시에 바뀐 것

4차시의 시작 화면, API 응답, npm workspaces와 의존성 버전을 유지합니다.

- 기존 앱별 ESLint flat config와 루트 Prettier 규칙을 검토하고 그대로 사용합니다.
- 루트 `npm run check`가 format:check → lint → build를 순서대로 실행합니다.
- web과 api에 각각 비밀 값이 없는 `.env.example`을 추가합니다.
- API가 선택적 `.env`와 PORT를 읽고, 잘못된 포트로 시작하지 않도록 검사합니다.
- 기본 디렉터리 6곳의 README가 파일 배치 기준을 설명합니다.

## 학생 실습 순서

1. 루트 README에서 Node/npm 버전을 확인하고 `npm ci`로 설치합니다.
2. `git status`, `git branch --show-current`, `git log -5 --oneline`으로 시작 상태를 확인합니다.
3. 자신의 실습용 브랜치를 만들고 아래 Issue의 완료 조건을 읽습니다.
4. README의 안전한 복사 명령으로 web `.env.local`과 api `.env`를 준비합니다. 기존 개인 파일은 덮어쓰지 않습니다.
5. `npm run dev:web`와 `npm run dev:api`를 서로 다른 터미널에서 실행하고 3000/4000 응답을 확인합니다.
6. API 서버를 종료하고 `apps/api/.env`의 PORT를 사용하지 않는 포트로 변경합니다. 다시 실행해 해당 포트의 동일한 JSON 응답을 확인합니다.
7. PORT를 4000으로 되돌리고 API를 다시 시작합니다. web 환경 값은 향후 API 클라이언트용이며 현재 화면은 아직 이 값을 사용하지 않습니다.
8. 코드 한 곳의 들여쓰기나 따옴표를 바꿔 저장합니다. `npm run format:check`의 차이를 보고 `npm run format`으로 정리합니다.
9. 개발 서버를 종료하고 `npm run check`로 두 앱의 포맷·코드 규칙·타입과 빌드를 확인합니다.
10. `git check-ignore apps/web/.env.local apps/api/.env`로 제외를 확인합니다.
11. `git diff`와 `git status --short`로 파일 목록을 확인하고, 개인 환경 파일 없이 변경 파일만 명시적으로 stage합니다.
12. `git diff --cached`를 읽고 `chore: configure development environment`로 커밋합니다. 원격 저장소가 연결된 수업 환경에서는 해당 브랜치를 push하고 PR을 만듭니다.

반복하는 흐름: **Issue → Branch → Coding → 실행 → git diff → Commit → PR**.

```bash
npm run format
npm run format:check
npm run lint
npm run build
# 위 세 검사를 순서대로 실행하는 통합 명령
npm run check
```

`format`은 파일을 수정하지만 `format:check`와 `lint`는 수정하지 않습니다. `build`는 생성물을 만들고 타입·빌드 오류를 확인합니다. `check`는 앞 단계가 실패하면 중단합니다.

## GitHub Issue 예시

**제목:** chore: configure development environment

- [ ] ESLint / Prettier의 역할과 현재 규칙을 설명한다.
- [ ] 앱별 환경 예제와 실제 파일을 구분한다.
- [ ] PORT 변경 후 API 실행을 확인한다.
- [ ] 디렉터리별 배치 규칙을 읽는다.
- [ ] format / lint / build 검사를 통과한다.
- [ ] 개인 환경 파일이 커밋에 포함되지 않는다.

이 문서는 Issue 예시이며 실제 GitHub Issue를 생성한 것은 아닙니다.

## 파일 배치 퀴즈

| 넣을 코드                            | 위치                            |
| ------------------------------------ | ------------------------------- |
| URL에 연결되는 페이지                | web의 src/app                   |
| 여러 기능의 공통 버튼                | web의 src/components            |
| 모집 기능 전용 카드·타입·요청 함수   | web의 src/features/recruitments |
| 공통 API 통신 도구                   | web의 src/lib                   |
| 여러 모듈이 공유하는 가드·데코레이터 | api의 src/common                |
| 모집 Controller·Service·Module       | api의 src/modules/recruitments  |
| NestJS용 Prisma 서비스               | api의 src/prisma                |
| 향후 Prisma 스키마·마이그레이션      | api의 앱 루트 prisma            |

현재 추가된 폴더의 README를 읽고 판단합니다. 미래 파일을 빈 코드로 생성하지 않습니다.

## 완료 체크리스트

- [ ] ESLint와 Prettier를 구분하고 검사 실패 시 무엇을 볼지 설명할 수 있다.
- [ ] .env.example에는 실제 비밀 값을 넣지 않는다.
- [ ] NEXT_PUBLIC_는 공개 값이며 클라이언트 번들에 빌드 시 반영됨을 이해한다.
- [ ] API의 외부 PORT → .env → 4000 우선순위를 설명할 수 있다.
- [ ] 환경 파일 변경 후 서버를 다시 시작할 수 있다.
- [ ] 각 기본 폴더의 역할을 설명할 수 있다.
- [ ] 루트 npm run check가 통과한다.
- [ ] git diff와 staged diff를 확인하고 별도 커밋으로 남긴다.

## 제작 시 검증 기록

실행일: **2026-09-12**, Windows / Node.js **22.17.1** / npm **10.9.2**.

| 검사               | 실제 결과                                                                                                         |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 별도 worktree 설치 | npm ci --offline --no-audit --no-fund 성공, 잠금 파일 그대로 610개 패키지 설치                                    |
| 변경 전 기준 검사  | 두 앱 lint/build 통과, 계획서만 포맷 정리한 뒤 전체 format:check 통과; 기존 파일의 포맷 문제 없음                 |
| 변경 전 PORT 재현  | 외부 PORT로 지정한 포트에서 응답하지 않아 검증 실패; 4000 고정 동작 확인                                          |
| API 환경 동작      | 실제 빌드된 서버로 9개 검사 통과: 파일 없음→4000, 예제→4000, 파일의 다른 포트, 외부 PORT 우선, 잘못된 값 5종 거부 |
| 잘못된 PORT        | abc, 빈 값, 0, 65536, 4000.5 모두 종료 코드 1과 명확한 오류 확인                                                  |
| API 응답 유지      | 유효 포트에서 HTTP 200 및 기존 JSON 응답 일치                                                                     |
| web 환경 파일      | 설치된 Next.js의 @next/env 로더로 .env.local 읽기 및 공개 API URL 값 확인                                         |
| Git 제외 규칙      | 루트/web/api의 .env, .env.local, .env.production 모두 제외; 앱별 .env.example은 추적 가능                         |
| 최종 통합 검사     | npm run check 종료 코드 0; format:check와 두 앱 lint/build 모두 통과                                              |

검증용 환경 파일에는 로컬 포트와 공개 예제만 사용했으며 검증 후 제거했습니다. 실행한 검증용 API 프로세스도 종료했습니다. 별도 테스트 프레임워크나 제품 API 호출 기능을 추가하지 않았습니다.

### 실행 환경 메모

- 이 PC의 기존 npm prefix가 누락된 전역 npm 경로를 가리켜, 실행 프로세스에만 `npm_config_prefix=C:\Program Files\nodejs`를 지정했습니다. 전역 설정과 원본 파일은 수정하지 않았습니다.
- 기존 작업의 npm 캐시를 사용해 오프라인으로 설치했습니다. 잠금 버전은 바꾸지 않았습니다.
- 설치 시 기존 ESLint 9 지원 종료 경고가 표시됩니다. 이번 차시에 린터 버전이나 Next.js 플러그인 조합을 바꾸지는 않습니다.
- 4차시 기록의 Windows 제한 환경에서 Nest watch 자동 재시작 문제는 이번 변경 범위가 아닙니다. 이번 환경변수 검증은 빌드된 API의 실제 실행으로 수행했습니다. 일반 수업 터미널에서 자동 재시작 실습을 별도로 확인하세요.
- 이번 검증에서는 npm audit를 다시 실행하지 않았습니다. 4차시의 보안 검사 결과를 현재 결과로 간주하지 않습니다.

## 기존 4차시 보존 방식

- 원본 브랜치 `main`과 원본 커밋 `83323814db60b1ef3fe41a2694e8ca7acdb54df7`에서 분기했습니다.
- 시작 시 원본 작업트리는 깨끗했습니다. 원본 작업 파일은 수정하지 않았습니다.
- 5차시는 별도 브랜치 `chore/session-05-dev-environment`와 연결 worktree `campus-crew-session-05`에 작성합니다.
- 4차시 화면 소스, Controller/Service/Module, checkpoint 문서, lockfile과 기존 ESLint·Prettier 설정은 유지합니다.
- 기존 커밋을 수정하거나 main에 병합하지 않습니다. 새 커밋으로 두 차시를 비교할 수 있습니다.
- 원본 저장소에 remote가 등록되어 있지 않아 push/PR 생성은 진행하지 않습니다.

연결 worktree는 Git 기록을 공유하므로 두 폴더를 이동할 때에는 Git worktree 기능을 사용합니다.

### 최종 확정 기록

- `npm run format` 성공. 기존 4차시 checkpoint·화면·설정 파일에는 포맷 변경도 발생하지 않았습니다.
- `npm run check` 성공: format:check, api/web lint, api/web build 모두 종료 코드 0.
- `git diff --check` 성공. package-lock.json 및 기존 ESLint/Prettier 설정의 diff 없음.
- 별도 읽기 전용 코드 리뷰에서 중요 문제 없음. API 개발 명령의 포트 설명 1곳을 실제 동작에 맞춰 수정했습니다.
- 원본은 여전히 main / 8332381이며 추적 파일과 index의 변경이 없습니다.
- 5차시 변경만 새 커밋 `chore: configure development environment`로 기록합니다. 최종 커밋 ID는 `git log -1 --oneline`으로 확인할 수 있습니다.
