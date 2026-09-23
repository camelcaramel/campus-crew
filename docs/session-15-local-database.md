# 15차시: PostgreSQL 실행과 DBeaver 접속

목표는 앱과 별개로 DB 서버를 띄우고 직접 접속하는 것입니다. Docker Desktop(Linux containers) 또는 Docker Engine + Compose, DBeaver를 준비합니다. 처음 실행할 때는 이미지와 DBeaver PostgreSQL 드라이버 다운로드를 위한 인터넷이 필요합니다. 모든 명령은 저장소 루트에서 실행합니다.

## 1. 환경 준비와 실행

Docker Desktop 또는 Docker Engine을 실행하고 `docker version`에서 **Client와 Server**가 모두 나오는지 확인합니다. 루트 `.env`가 없을 때만 `.env.example`을 복사합니다. 기존 파일이 있으면 필요한 값만 비교해 추가하세요.

```powershell
# Windows PowerShell — 최초 한 번
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

macOS/Linux에서는 `test -f .env || cp .env.example .env`를 사용합니다. 루트 `.env`는 Compose용이며 기존 `apps/api/.env`, `apps/web/.env.local`과 역할이 다릅니다. 실제 `.env`는 Git에서 제외됩니다.

```bash
docker compose config
docker compose up -d
docker compose ps
```

`postgres`가 running(`Up`)이고 `(healthy)`인지 확인합니다. 처음에는 `(health: starting)`일 수 있으므로 잠시 후 `ps`를 다시 실행합니다. config 출력에는 비밀번호가 포함되므로 실제 비밀 값이 있는 출력은 공유하지 않습니다.

기본 env 값에서 추가 상태 확인:

```bash
docker compose exec postgres pg_isready -U campus_crew -d campus_crew
```

`accepting connections`이면 서버가 연결을 받을 준비가 된 것입니다.

## 2. DBeaver 연결

새 연결에서 **PostgreSQL**을 선택하고 아래 값을 입력합니다.

| 항목     | 값            |
| -------- | ------------- |
| Host     | `localhost`   |
| Port     | `5432`        |
| Database | `campus_crew` |
| Username | `campus_crew` |
| Password | `campus_crew` |

**Test Connection**을 누릅니다. 최초 드라이버 다운로드 요청이 나오면 설치한 뒤 다시 테스트합니다. 성공하면 Finish로 저장하고 연결을 펼쳐 `Schemas → public`을 확인합니다. 아직 수업용 테이블이 없는 것이 정상입니다.

이 연결의 SQL Editor에서 다음 읽기 전용 SQL을 실행합니다.

```sql
SELECT 1;
SELECT current_database();
SELECT current_user;
SELECT version();
```

첫 결과는 `1`, DB 이름과 사용자는 각각 `campus_crew`, 버전은 PostgreSQL 17 계열입니다. CLI에서도 확인할 수 있습니다.

```bash
docker compose exec postgres psql -U campus_crew -d campus_crew -c "SELECT current_database();"
```

## 3. 종료와 다시 연결

```bash
docker compose down
docker volume ls
docker compose up -d
docker compose ps
```

`healthy`가 되면 DBeaver에서 재연결하고 같은 SQL을 실행합니다. `down`은 컨테이너와 네트워크를 제거하지만 `<프로젝트명>_postgres_data` named volume은 보존합니다. 다시 실행한 컨테이너는 같은 volume을 사용합니다. 이 차시에서는 테이블을 만들지 않으므로 사용자 데이터 행의 유지 실험은 다음 차시 이후에 합니다.

같은 저장소 폴더에서 실행하세요. 폴더명이나 Compose 프로젝트명(`-p`)을 바꾸면 다른 volume을 사용할 수 있습니다. **`docker compose down -v`는 DB volume까지 삭제하므로 실습에서 사용하지 않습니다.** 실습을 마치면 `docker compose down`으로 종료합니다.

## 핵심 개념과 문제 확인

- **image**: `postgres:17`은 PostgreSQL 17 실행 환경의 원본입니다. **container**는 이 이미지로 만든 실제 DB 서버 프로세스의 실행 공간입니다. NestJS를 켜지 않아도 접속할 수 있습니다.
- **port**: `5432:5432`는 내 PC의 5432번을 컨테이너의 5432번으로 연결합니다. 다른 PostgreSQL이 이미 사용 중이면 포트 충돌 원인을 확인하고 수업 DB가 5432를 사용할 수 있도록 조정합니다.
- **환경변수**: `.env`의 DB 이름·계정·비밀번호를 Compose가 컨테이너에 전달합니다. 셸에 같은 이름의 변수가 있으면 `.env`보다 우선합니다. 이 값들은 빈 volume의 최초 초기화에 적용되며, `.env`만 바꿔도 기존 DB 계정이 변경되는 것은 아닙니다.
- **volume**: 데이터를 컨테이너와 별도로 보관하므로 컨테이너를 교체해도 유지됩니다. healthcheck의 `pg_isready`는 접속 준비 상태를 확인합니다.
- **DBeaver**: DB GUI 클라이언트입니다. DB 서버 자체가 아니며 앱 없이 SQL로 서버에 직접 접속합니다.
- **DATABASE_URL**: 프로토콜·계정·비밀번호·호스트·포트·DB를 담은 다음 Prisma 차시용 접속 문자열입니다. 지금은 예시만 준비하며 NestJS가 루트 `.env`를 자동으로 읽도록 바꾸지 않습니다. Prisma 설정 위치와 env 로딩은 다음 차시에서 연결합니다. 다른 값을 쓴다면 URL과 DBeaver 설정도 맞춥니다.
- **수업 흐름**: 14차시 ERD는 설계, PostgreSQL은 실제 저장소, 다음 차시의 Prisma는 설계를 코드로 표현하고 DB에 연결하는 도구입니다. 지금은 Prisma·migration·seed·테이블 생성·NestJS query를 하지 않습니다.

서버에 연결되지 않으면 Docker 실행 상태와 `docker compose ps`, `docker compose logs postgres`를 확인합니다. DBeaver 연결 실패 시에는 host/port/DB/계정/비밀번호, 드라이버 설치 여부, 기존 volume의 초기 계정을 확인합니다.

참고: [Compose 형식](https://docs.docker.com/reference/compose-file/), [PostgreSQL 공식 이미지](https://hub.docker.com/_/postgres), [down과 volume](https://docs.docker.com/reference/cli/docker/compose/down/).
