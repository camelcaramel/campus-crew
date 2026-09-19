# lib — 공통 기술 코드

여러 기능이 사용하는 통신 도구와 유틸리티를 둡니다. 예: `api-client.ts`.
기능 전용 요청 함수는 `features/<기능>/api.ts`에 둡니다.

18차시의 `api-client.ts`는 상대 경로 `/api/*`를 fetch하고 HTTP 오류를 Error로 전달합니다. 브라우저에 별도 API origin을 설정하지 않습니다. `next.config.ts`의 rewrite가 Nest `http://localhost:4000/api/*`로 전달합니다.

`query-client.ts`는 캐시 설정을 생성합니다. `src/providers.tsx`에서 한 번 생성하여 앱 안의 Query들이 같은 캐시를 사용합니다. 5차시의 `NEXT_PUBLIC_API_BASE_URL` 예시는 이번 조회 경로에서 사용하지 않습니다.
