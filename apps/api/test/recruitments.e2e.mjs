import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import process from 'node:process';
import { after, before, test } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { fileURLToPath, URL } from 'node:url';

let server;
let baseUrl;
let serverOutput = '';
const body = {
  title: 'React 스터디 팀원 모집',
  content: '주 1회 함께 공부할 팀원을 모집합니다.',
  category: 'STUDY',
};

before(async () => {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise((resolve, reject) => {
    listener.close((error) => (error ? reject(error) : resolve()));
  });
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(
    process.execPath,
    [fileURLToPath(new URL('../dist/main.js', import.meta.url))],
    {
      env: { ...process.env, PORT: String(port) },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk;
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk;
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await globalThis.fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Wait only while our server starts listening.
    }
    if (server.exitCode !== null) break;
    await setTimeout(100);
  }
  throw new Error(`API did not start: ${serverOutput}`);
});

after(async () => {
  if (server && server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill();
    await exited;
  }
});

test('기존 루트 상태 응답을 보존한다', async () => {
  const response = await globalThis.fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    message: 'Campus Crew API is running',
  });
});

test('목록과 상세에서 초기 모집글을 JSON으로 읽는다', async () => {
  const response = await globalThis.fetch(`${baseUrl}/api/recruitments`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  const items = await response.json();
  assert.equal(items.length, 3);
  assert.deepEqual(
    items.map(({ id }) => id),
    [1, 2, 3],
  );
  const detail = await globalThis.fetch(`${baseUrl}/api/recruitments/1`);
  assert.equal(detail.status, 200);
  assert.deepEqual(await detail.json(), items[0]);
});

test('존재하지 않는 id의 상세 조회는 404다', async () => {
  const response = await globalThis.fetch(`${baseUrl}/api/recruitments/999999`);
  assert.equal(response.status, 404);
  const error = await response.json();
  assert.equal(error.statusCode, 404);
  assert.equal(error.message, '모집글을 찾을 수 없습니다.');
});

test('POST는 201과 생성 객체를 반환하고 이후 GET에서 조회된다', async () => {
  const response = await globalThis.fetch(`${baseUrl}/api/recruitments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.deepEqual(created, { id: 4, ...body, status: 'OPEN' });

  const detail = await globalThis.fetch(`${baseUrl}/api/recruitments/4`);
  assert.equal(detail.status, 200);
  assert.deepEqual(await detail.json(), created);
  const list = await globalThis.fetch(`${baseUrl}/api/recruitments`);
  assert.equal(list.status, 200);
  const items = await list.json();
  assert.equal(items.length, 4);
  assert.deepEqual(
    items.find(({ id }) => id === 4),
    created,
  );
});

test('연속 생성 id는 증가하고 입력 id와 status는 서버 값을 덮어쓰지 못한다', async () => {
  const response = await globalThis.fetch(`${baseUrl}/api/recruitments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, id: 1, status: 'CLOSED' }),
  });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { id: 5, ...body, status: 'OPEN' });
});

test('Swagger UI와 명세에서 GET/POST 및 POST body를 확인할 수 있다', async () => {
  const ui = await globalThis.fetch(`${baseUrl}/docs`);
  assert.equal(ui.status, 200);
  assert.match(await ui.text(), /swagger-ui/);
  const response = await globalThis.fetch(`${baseUrl}/docs-json`);
  assert.equal(response.status, 200);
  const document = await response.json();
  assert.equal(document.info.title, 'Campus Crew API');
  assert.equal(document.info.version, '1.0');
  assert.ok(document.paths['/api/recruitments'].get);
  assert.ok(document.paths['/api/recruitments/{id}'].get);
  const post = document.paths['/api/recruitments'].post;
  assert.ok(post.responses['201']);
  const schemaRef = post.requestBody.content['application/json'].schema.$ref;
  const schema = document.components.schemas[schemaRef.split('/').at(-1)];
  assert.deepEqual(schema.required, ['title', 'content', 'category']);
  assert.equal(schema.properties.title.example, body.title);
  assert.equal(schema.properties.content.example, body.content);
  assert.deepEqual(schema.properties.category.enum, [
    'STUDY',
    'PROJECT',
    'CONTEST',
  ]);
});
