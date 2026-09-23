# Campus Crew 14차시 Database / ERD Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** 학생이 DB 영속성, PK/FK, 1:N 관계를 이해하고 User / Recruitment / Application 설계를 다음 Prisma 차시의 청사진으로 사용할 수 있게 한다.

**Architecture:** 13차시 커밋 `1409edb`의 애플리케이션 코드를 보존하고 설계 문서만 추가한다. 현재 Service의 메모리 배열과 미래 DB 저장 흐름을 구분한다. 별도 브랜치 `docs/session-14-database-erd`와 전용 worktree에서 진행한다.

**Tech Stack:** Markdown, Mermaid ERD, 기존 npm / Prettier / ESLint / NestJS / Next.js 검증 도구.

**Spec:** 이 작업의 사용자 요청(2026-09-14 Campus Crew 14차시); 아래 제약과 단계에 필수 범위를 기록한다.

## Global Constraints

- 기존 4~13차시 코드와 커밋을 보존하고 파괴적 Git 명령을 사용하지 않는다.
- 변경 파일은 이 계획과 `docs/erd.md` 두 개로 제한한다. 기존 architecture 문서는 없으므로 새로 확장하지 않는다.
- PostgreSQL 설치/실행, Docker Compose, DBeaver, Prisma 설치/schema/migration, SQL CREATE TABLE, auth 구현은 하지 않는다.
- User: id, email unique, name, passwordHash, createdAt, updatedAt.
- Recruitment: id, title, content, category, status default OPEN, authorId FK → User.id, createdAt, updatedAt.
- Application: id, message, status default PENDING, applicantId FK → User.id, recruitmentId FK → Recruitment.id, createdAt, updatedAt, unique(applicantId, recruitmentId).
- Enums: RecruitmentCategory = STUDY | PROJECT | CONTEST; RecruitmentStatus = OPEN | CLOSED; ApplicationStatus = PENDING | APPROVED | REJECTED.

## Task 1: ERD 설계 문서 작성

**Files:** Create `docs/erd.md`.

**Interfaces:** 현재 `apps/api/src/modules/recruitments/recruitments.service.ts`와 13차시 문서를 참고한다. 다음 차시가 사용할 모델명, 필드명, 관계 및 제약을 문서로 제공한다.

- [x] 메모리 배열과 DB 영속성, Table / Row / Column, PK / FK / 1:N을 작은 예시로 설명한다.
- [x] 세 엔티티의 모든 주요 필드, 역할, 타입 방향, 기본값과 enum 값을 표로 작성한다.
- [x] User → Recruitment(작성자), User → Application(지원자), Recruitment → Application의 1:N 관계와 모든 필드를 완성된 Mermaid ERD로 표현한다.
- [x] Application의 자체 id, message, status, timestamps가 지원 기록의 생명주기를 표현함을 설명한다.
- [x] 복합 unique의 허용/거절 예시와 동시 요청에서 DB 제약이 필요한 이유를 설명한다. 두 FK 각각에 단독 unique를 걸지 않는다.
- [x] Recruitment 실제 삭제 시 Application cascade를 고려하는 이유, 이력 손실, CLOSED와 삭제의 차이, User 삭제 정책은 별도 결정임을 설명한다.
- [x] 현재 Controller → Service → 배열과 미래 Service → Prisma → DB를 연결하고 학생 확인 질문을 제공한다. 실제 schema는 작성하지 않는다.

## Task 2: 검증 및 별도 커밋

**Files:** Update this plan with results; no application changes.

- [x] 기존 의존성을 잠금 파일 기준으로 준비하고 `npm run format:check`가 문서를 포함함을 확인한다. 포맷 수정은 새 Markdown 두 파일에만 적용한다.
- [x] Mermaid 공식 문법과 ERD를 대조하고 가능한 로컬 렌더러로 구문/렌더링을 검증한다. 도구가 없으면 검증 한계를 기록한다.
- [x] `npm run format:check`, `npm run lint`, `npm run build`를 실행하고 결과를 기록한다. 기존 실패가 있으면 관련 없는 코드를 고치지 않고 구분해 보고한다.
- [x] `git diff --check`와 기준 커밋 대비 변경 목록으로 문서 두 개만 변경됨을 확인한다. 13차시 worktree의 HEAD와 상태가 유지되는지도 확인한다.
- [x] 두 문서만 stage하고 `docs: add campus crew erd`로 새 커밋을 만든다. 브랜치와 worktree를 보존하고 변경 파일, 관계, 제약, 검증 및 학습 포인트를 보고한다.

## 검증 기록

2026-09-14 검증 결과:

| 검사                                           | 결과                                                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 문서 범위                                      | 계획과 docs/erd.md 두 개만 추가; 기존 architecture 문서 없음                                             |
| format:check 적용 범위                         | prettier --check .이며 .prettierignore가 docs/*.md를 제외하지 않으므로 두 새 문서도 포함                 |
| npm run format:check                           | 전체 저장소 통과                                                                                         |
| npm run lint                                   | API / Web 모두 통과                                                                                      |
| npm run build                                  | NestJS / Next.js 모두 통과                                                                               |
| node --test apps/api/test/recruitments.e2e.mjs | 기존 HTTP 회귀 테스트 6개 통과, 실패 0개                                                                 |
| Mermaid                                        | 문서 코드 블록 그대로 Mermaid Live Editor v11.17.2에서 세 엔티티의 모든 필드와 세 관계선을 렌더링해 확인 |
| git diff --check                               | 통과                                                                                                     |
| 기존 코드                                      | 기준 1409edb 대비 apps/, package.json, package-lock.json 변경 없음                                       |
| 13차시 worktree                                | HEAD 1409edb 및 미커밋 변경 없는 상태 유지                                                               |

로컬 npm 캐시에 일부 패키지가 없어 오프라인 npm ci는 실패했다. 13차시의 기존 node_modules를 복사해 검증 환경을 준비했다. 첫 Web build에서 @hookform/resolvers/zod 누락을 확인했고, apps/web/node_modules에 따로 설치된 의존성까지 복사한 뒤 전체 build와 lint가 통과했다. 확인한 설치 패키지 623개의 버전이 잠금 파일과 일치한다. 애플리케이션 코드와 의존성 선언/잠금 파일은 수정하지 않았다.

새 커밋 메시지: `docs: add campus crew erd`. 기존 브랜치를 병합하거나 원격에 push하지 않고 14차시 브랜치와 worktree를 보존한다.
