import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendEmail, EmailConfigError } from '@/lib/email';

const env = { RESEND_API_KEY: 're_test', CONTACT_TO_EMAIL: 'owner@example.com' } as unknown as NodeJS.ProcessEnv;

function fakeFetch(status: number, body: unknown) {
  const calls: { url: string; init: RequestInit }[] = [];
  const impl = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init || {} });
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  return { impl, calls };
}

test('throws EmailConfigError when env is missing', async () => {
  await assert.rejects(
    () => sendEmail({ subject: 's', text: 't' }, fakeFetch(200, {}).impl, {} as NodeJS.ProcessEnv),
    EmailConfigError,
  );
});

test('posts the message to Resend with the owner as recipient', async () => {
  const { impl, calls } = fakeFetch(200, { id: 'abc' });
  const result = await sendEmail({ subject: 'Hi', text: 'Body', replyTo: 'jane@example.com' }, impl, env);
  assert.deepEqual(result, { id: 'abc' });
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal((calls[0].init.headers as Record<string, string>).Authorization, 'Bearer re_test');
  const payload = JSON.parse(String(calls[0].init.body));
  assert.deepEqual(payload.to, ['owner@example.com']);
  assert.equal(payload.subject, 'Hi');
  assert.equal(payload.text, 'Body');
  assert.equal(payload.reply_to, 'jane@example.com');
  assert.equal(payload.from, 'US Motorcycle Clubs <onboarding@resend.dev>');
});

test('honours CONTACT_FROM_EMAIL', async () => {
  const { impl, calls } = fakeFetch(200, { id: 'x' });
  await sendEmail({ subject: 's', text: 't' }, impl, { ...env, CONTACT_FROM_EMAIL: 'Site <hello@usmotorcycleclubs.com>' });
  assert.equal(JSON.parse(String(calls[0].init.body)).from, 'Site <hello@usmotorcycleclubs.com>');
});

test('throws on a non-2xx response', async () => {
  await assert.rejects(
    () => sendEmail({ subject: 's', text: 't' }, fakeFetch(422, { message: 'bad' }).impl, env),
    /Resend responded 422/,
  );
});
