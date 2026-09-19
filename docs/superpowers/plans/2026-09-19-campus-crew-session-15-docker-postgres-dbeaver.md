# 15차시 구현 계획: Docker PostgreSQL과 DBeaver

## 목표와 범위

학생이 NestJS와 별개인 PostgreSQL 서버를 직접 실행하고 DBeaver로 접속한다.
14차시 `960aff1`에서 새 브랜치 `chore/session-15-local-postgres`와 별도 worktree를 만든다.
4~14차시 코드와 커밋을 보존하고 새 커밋 `chore: add local postgres environment`만 추가한다.
Prisma 설치·schema·migration·seed·테이블 생성·앱 DB 연결·인증·배포는 범위 밖이다.

## 1. 실행 설정

- 루트 `compose.yaml`: `postgres:17` 서비스 `postgres` 하나만 둔다.
- 루트 `.env.example`: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`의 학습용 값은 `campus_crew`, `POSTGRES_PORT`는 `5432`로 둔다.
- ports는 `${POSTGRES_PORT:-5432}:5432`로 기본 `5432:5432`를 만든다.
- `postgres_data` named volume을 `/var/lib/postgresql/data`에 연결한다.
- `pg_isready`로 DB 사용자와 DB 이름을 지정한 간단한 healthcheck를 둔다.
- Compose 변수 치환과 컨테이너의 환경변수 확장을 구분하도록 healthcheck에서 `$$`를 쓴다.
- 루트 env 예시에 다음 Prisma 차시용 `DATABASE_URL`을 준비하되 앱에 연결하지 않는다.
- 기존 `.gitignore`의 `.env*`, `!.env.example`을 유지하고 실제 `.env` 제외 여부를 확인한다.

## 2. 학생 안내

- `docs/session-15-local-database.md`: Docker 상태 → env 복사 → 시작 → 상태 확인 → DBeaver Test Connection → public → 읽기 전용 SQL → 종료·재시작 흐름을 간결하게 적는다.
- `README.md`: 새 안내 링크와 짧은 시작 명령을 추가하고 루트 Compose env와 기존 앱 env의 역할을 구분한다.
- volume 유지, 기존 volume에서는 초기 계정 환경변수가 재적용되지 않는 점, 포트 충돌 시 확인 방법을 설명한다.

## 3. 검증과 완료 기준

저장소 루트에서 실행한다. 실제 `.env`는 `.env.example`에서 최초 한 번만 복사한다.

```bash
docker version
docker compose config
docker compose up -d
docker compose ps
docker compose exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT current_database();"'
docker compose down
docker compose up -d
docker compose ps
docker compose down
npm run format:check
npm run lint
npm run build
git check-ignore .env
git ls-files -- .env
git diff --check
```

기대 결과: config 유효, DB healthy, 조회 결과 `campus_crew`, 재시작 후 같은 named volume 연결, 최종 컨테이너 종료 및 volume 보존, 기존 코드 검사 통과, `.env`는 ignored이면서 미추적.
Docker 실행 환경이 막히면 시도한 명령과 오류를 구분해 기록하고 실행 성공으로 보고하지 않는다.
GUI를 직접 확인하지 못하면 DBeaver 연결은 학생의 수동 확인 항목으로 명시한다.

## 검토 중점

- 서비스가 하나이며 초기화 SQL이나 테이블 생성 코드가 없는가?
- env 누락 시 필수 DB 설정 오류가 명확한가? 기본 포트가 5432인가?
- `down` 후 volume을 보존하며 `down -v`를 실습 명령으로 쓰지 않는가?
- 실제 `.env`가 커밋에 들어가지 않는가?
- 기존 앱 소스와 lockfile이 변경되지 않았는가?

실행 기록은 작업 폴더에 남기고, 최종 결과에서 실제 통과·실패·미실행을 구분한다.
