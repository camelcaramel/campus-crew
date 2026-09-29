import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function load(name) {
  let source;
  try {
    source = readFileSync(
      new URL('../src/features/auth/' + name + '.ts', import.meta.url),
      'utf8',
    );
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const result = { exports: {} };
  vm.runInThisContext('(function(require,module,exports){' + compiled + '\n})')(
    require,
    result,
    result.exports,
  );
  return result.exports;
}
const valid = {
  name: '김학생',
  email: 'student@example.com',
  password: 'password123',
  confirmPassword: 'password123',
};

test('signup validates name, email, password and confirmation before submission', () => {
  const { signupSchema } = load('signup-schema');
  assert.ok(signupSchema, 'signup schema must exist');
  assert.equal(signupSchema.safeParse(valid).success, true);
  for (const change of [
    { name: ' ' },
    { name: '김' },
    { name: '가'.repeat(21) },
    { email: 'bad' },
    { password: 'short' },
    { confirmPassword: 'different' },
  ]) {
    assert.equal(
      signupSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
  }
  const mismatch = signupSchema.safeParse({
    ...valid,
    confirmPassword: 'different',
  });
  assert.deepEqual(mismatch.error.issues[0].path, ['confirmPassword']);
});

test('signup respects bcrypt byte limits and Unicode code point lengths without changing passwords', () => {
  const { signupSchema } = load('signup-schema');
  assert.ok(signupSchema);
  for (const password of [
    'a'.repeat(8),
    'a'.repeat(50),
    '가'.repeat(24),
    '😀'.repeat(8),
    '  secret  ',
  ]) {
    const parsed = signupSchema.safeParse({
      ...valid,
      password,
      confirmPassword: password,
    });
    assert.equal(parsed.success, true);
    assert.equal(parsed.data.password, password);
  }
  for (const password of [
    'a'.repeat(51),
    '가'.repeat(25),
    '\uD800'.repeat(8),
    '😀'.repeat(4),
  ]) {
    assert.equal(
      signupSchema.safeParse({ ...valid, password, confirmPassword: password })
        .success,
      false,
    );
  }
  assert.equal(
    signupSchema.parse({ ...valid, name: ' 김학생 ' }).name,
    '김학생',
  );
  for (const email of ['학생@example.com', '"student name"@example.com']) {
    assert.equal(signupSchema.safeParse({ ...valid, email }).success, true);
  }
});

test('signup sends only API fields to same-origin and returns public user without logging in', async (t) => {
  const { signup } = load('signup-api');
  assert.equal(typeof signup, 'function');
  const publicUser = {
    id: 42,
    name: '김학생',
    email: valid.email,
    createdAt: '2026-09-29T00:00:00Z',
  };
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async (path, options) => {
    requests++;
    assert.equal(path, '/api/auth/signup');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), {
      name: valid.name,
      email: valid.email,
      password: valid.password,
    });
    return Response.json(publicUser, { status: 201 });
  });
  assert.deepEqual(await signup(valid), publicUser);
  assert.equal(requests, 1);
});

test('signup gives actionable duplicate and validation errors without exposing server internals', async (t) => {
  const { signup } = load('signup-api');
  assert.equal(typeof signup, 'function');
  let status = 409;
  t.mock.method(globalThis, 'fetch', async () =>
    Response.json({ message: 'private database detail' }, { status }),
  );
  await assert.rejects(signup(valid), /이미 사용 중인 이메일/);
  status = 400;
  await assert.rejects(signup(valid), /입력값/);
  status = 500;
  await assert.rejects(signup(valid), /잠시 후/);
});

test('signup handles network and non-JSON proxy failures as retryable errors', async (t) => {
  const { signup } = load('signup-api');
  assert.equal(typeof signup, 'function');
  t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Failed to fetch');
  });
  await assert.rejects(signup(valid), /연결/);
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('<html>bad gateway</html>', { status: 502 }),
  );
  await assert.rejects(signup(valid), /잠시 후/);
});
