const { spawnSync } = require('node:child_process');
const { existsSync, readdirSync } = require('node:fs');
const { resolve } = require('node:path');
const { loadEnvFile } = require('node:process');

const apiRoot = resolve(__dirname, '..');
const envFile = resolve(apiRoot, '../../.env.test');
if (existsSync(envFile)) loadEnvFile(envFile);

// Never fall back to the development/production DATABASE_URL.
const url = new URL(process.env.TEST_DATABASE_URL || 'postgresql://invalid');
if (
  !['postgres:', 'postgresql:'].includes(url.protocol) ||
  !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
  !/^\/[a-zA-Z0-9_]+_test$/.test(url.pathname) ||
  // pg query parameters can override the URL host/database. Only schema is needed.
  [...url.searchParams.keys()].some((key) => key !== 'schema')
) {
  throw new Error(
    'TEST_DATABASE_URL must use loopback, a database ending in _test, and only the schema query parameter.',
  );
}
process.env.DATABASE_URL = url.toString();
process.env.JWT_SECRET ||=
  'session-27-test-only-secret-never-use-in-production';
process.env.NODE_ENV = 'test';

function run(entry, args = []) {
  const result = spawnSync(process.execPath, [entry, ...args], {
    cwd: apiRoot,
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const prismaCli = resolve(
  require.resolve('prisma/package.json'),
  '../build/index.js',
);
run(prismaCli, ['generate']);
if (process.argv.includes('--prepare')) {
  run(prismaCli, ['migrate', 'deploy']);
  run(require.resolve('ts-node/dist/bin.js'), [
    '--project',
    'tsconfig.prisma.json',
    'prisma/seed.ts',
  ]);
} else {
  run(require.resolve('@nestjs/cli/bin/nest.js'), ['build']);
  if (!process.argv.includes('--legacy')) {
    run(require.resolve('jest/bin/jest'), [
      '--config',
      'test/jest.config.cjs',
      '--runInBand',
    ]);
  }
  if (process.argv.includes('--all') || process.argv.includes('--legacy')) {
    const files = readdirSync(__dirname).filter((name) =>
      name.endsWith('.e2e.mjs'),
    );
    const result = spawnSync(
      process.execPath,
      [
        '--test',
        '--test-concurrency=1',
        ...files.map((name) => resolve(__dirname, name)),
      ],
      {
        cwd: apiRoot,
        env: process.env,
        stdio: 'inherit',
        windowsHide: true,
      },
    );
    if (result.error) throw result.error;
    process.exitCode = result.status ?? 1;
  }
}
