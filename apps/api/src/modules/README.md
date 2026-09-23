# modules — 기능별 NestJS 모듈

기능을 구현할 때 Controller, Service, Module과 DTO를 기능 폴더에 함께 둡니다.
예: `recruitments/recruitments.controller.ts`, `recruitments/recruitments.service.ts`, `recruitments/recruitments.module.ts`.

흐름은 Controller → Service입니다. 데이터베이스 차시에서 Service → Prisma를 연결합니다.
새 모듈은 `app.module.ts`에 등록합니다.

4차시 시작 응답을 담당하는 `app.controller.ts`, `app.service.ts`는 원래 위치에 유지합니다.
5차시에는 기능 모듈을 생성하거나 이동하지 않습니다.
