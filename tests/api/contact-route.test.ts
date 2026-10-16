import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '@/app/api/contact/route';

const realFetch = globalThis.fetch;
const realConsoleError = console.error;
const realEnv = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
};
let sent: unknown[] = [];

function restoreEnv(key: keyof typeof realEnv) {
  if (realEnv[key] === undefined) delete process.env[key];
  else process.env[key] = realEnv[key];
}

beforeEach(() => {
  sent = [];
  process.env.RESEND_API_KEY = 're_test';
  process.env.CONTACT_TO_EMAIL = 'owner@example.com';
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    sent.push(JSON.parse(String(init?.body)));
    return new Response(JSON.stringify({ id: 'ok' }), { status: 200 });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realConsoleError;
  restoreEnv('RESEND_API_KEY');
  restoreEnv('CONTACT_TO_EMAIL');
});

function post(body: unknown) {
  return POST(new Request('http://localhost/api/contact', { method: 'POST', body: JSON.stringify(body) }));
}

const good = { name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'Hello' };

test('valid message is emailed and acknowledged', async () => {
  const res = await post(good);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true });
  assert.equal(sent.length, 1);
  assert.equal((sent[0] as { reply_to: string }).reply_to, 'jane@example.com');
});

test('honeypot returns success and sends nothing', async () => {
  const res = await post({ ...good, website: 'spam' });
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test('invalid payload is a 400', async () => {
  const res = await post({ ...good, email: 'bad' });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'Please enter a valid email' });
});

test('missing email config is a 503 with a clear message and names the variable', async () => {
  delete process.env.CONTACT_TO_EMAIL;
  const logged: string[] = [];
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(' '));
  };
  const res = await post(good);
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: 'Contact form is not configured' });
  const output = logged.join('\n');
  assert.match(output, /CONTACT_TO_EMAIL/);
  assert.doesNotMatch(output, /re_test/);
});

test('provider failure is a 500 with a generic message', async () => {
  globalThis.fetch = (async () => new Response('boom', { status: 502 })) as typeof fetch;
  console.error = () => {};
  const res = await post(good);
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { error: 'Failed to send message' });
});
