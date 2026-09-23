# common — 여러 모듈의 공통 코드

여러 기능 모듈이 실제로 공유하는 가드, 데코레이터 등을 둡니다.
예: `guards/jwt-auth.guard.ts`, `decorators/current-user.decorator.ts`.

한 기능만 사용하는 코드는 해당 `modules/<기능>/`에 둡니다.
현재 환경 파일 로딩과 PORT 확인은 시작 단계인 `main.ts`에서 처리합니다.

5차시에는 인증·공통 클래스나 하위 폴더를 미리 생성하지 않습니다.
