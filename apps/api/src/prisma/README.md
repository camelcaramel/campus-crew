# prisma — NestJS와 데이터베이스 연결

17차시의 `PrismaService`는 생성된 `PrismaClient`를 상속하고 `PrismaPg`로 PostgreSQL에 연결합니다. `OnModuleInit`에서 `$connect()`를 호출합니다.

`PrismaModule`에서 provider를 한 번 등록·export하고 `RecruitmentsModule`에서 import합니다. 요청마다 새 Client를 만들지 않습니다. 이 차시에는 별도 repository나 추가 생명주기 추상화를 만들지 않습니다.

스키마와 마이그레이션은 이 폴더와 구분하여 API 앱 루트의 `apps/api/prisma/`에 둡니다.
예: `apps/api/prisma/schema.prisma`.

API는 시작 시 루트 `.env`를 읽습니다. 프로세스 환경 변수, `apps/api/.env`, 루트 `.env` 순으로 우선합니다. 연결 문자열을 소스에 넣지 않습니다.

Client 생성 위치는 16차시의 `apps/api/generated/prisma`를 유지합니다. `rootDir: "."`로 소스와 Client를 함께 컴파일하므로 실행 파일은 `dist/src/main.js`입니다. 자세한 설명은 [17차시 안내](../../../../docs/session-17-prisma-crud.md)를 참고하세요.
