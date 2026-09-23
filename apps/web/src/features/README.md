# features — 사용자 기능별 코드

인증, 모집글, 신청처럼 기능별 폴더에 전용 UI, 타입, API 호출 함수를 함께 둡니다.
예: `recruitments/recruitment-card.tsx`, `recruitments/types.ts`, `recruitments/api.ts`.

페이지 파일은 `app/`, 여러 기능이 공유하는 UI는 `components/`, 공통 통신 도구는 `lib/`에 둡니다.

5차시에는 로그인·모집 기능을 구현하지 않습니다. 실제 기능을 만들 때 해당 폴더를 추가합니다.
