import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // src/main.ts와 dist/src/main.js에서 모두 같은 API/저장소 .env를 찾습니다.
  const apiRoot = existsSync(resolve(__dirname, '../package.json'))
    ? resolve(__dirname, '..')
    : resolve(__dirname, '../..');
  // 프로세스 환경 변수 > apps/api/.env > 저장소 루트 .env 순으로 우선합니다.
  for (const envPath of [
    resolve(apiRoot, '.env'),
    resolve(apiRoot, '../../.env'),
  ]) {
    if (existsSync(envPath)) loadEnvFile(envPath);
  }

  const port = Number(process.env.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Campus Crew API')
    .setDescription(
      'Prisma와 PostgreSQL로 모집글 GET/POST/PATCH/DELETE를 실습하는 API입니다.',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  Logger.error(error, undefined, 'Bootstrap');
  process.exitCode = 1;
});
