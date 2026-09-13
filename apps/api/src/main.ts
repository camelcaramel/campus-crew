import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // src와 dist 모두 한 단계 위가 API 앱 루트입니다.
  const envPath = resolve(__dirname, '../.env');
  if (existsSync(envPath)) {
    loadEnvFile(envPath);
  }

  const port = Number(process.env.PORT ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Campus Crew API')
    .setDescription(
      '모집글을 조회하고 만들어 보며 GET과 POST 요청을 배우는 API입니다.',
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
