import { resolve } from 'node:path';
import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Share the session 15 repository-root .env with Docker Compose.
config({ path: resolve(__dirname, '../../.env'), quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --project tsconfig.prisma.json prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
