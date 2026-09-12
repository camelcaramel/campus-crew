# lib — 공통 기술 코드

여러 기능이 사용하는 통신 도구와 유틸리티를 둡니다. 예: `api-client.ts`.
기능 전용 요청 함수는 `features/<기능>/api.ts`에 둡니다.

향후 API 클라이언트에서 `process.env.NEXT_PUBLIC_API_BASE_URL`을 읽습니다.
이 값은 브라우저에 공개되므로 비밀 키를 넣지 않습니다.

5차시에는 `apps/web/.env.example`만 준비합니다. 아직 소비하는 코드가 없으므로 값만 바꿔도 현재 시작 화면의 동작은 달라지지 않습니다.
