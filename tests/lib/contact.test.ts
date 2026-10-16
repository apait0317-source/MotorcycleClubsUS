import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, formatContactEmail, correctionHref, correctionPrefill } from '@/lib/contact';

const good = { name: ' Jane ', email: 'Jane@Example.com', subject: 'Hi', message: 'Hello there' };

test('honeypot filled means silent accept', () => {
  assert.deepEqual(validateContact({ ...good, website: 'http://spam' }), { ok: 'honeypot' });
});

test('every field is required', () => {
  assert.deepEqual(validateContact({ ...good, message: '  ' }), { ok: false, error: 'All fields are required' });
  assert.deepEqual(validateContact(null), { ok: false, error: 'All fields are required' });
});

test('length limits are enforced per field', () => {
  assert.deepEqual(validateContact({ ...good, subject: 'x'.repeat(201) }), { ok: false, error: 'subject is too long' });
});

test('email must look like an email', () => {
  assert.deepEqual(validateContact({ ...good, email: 'nope' }), { ok: false, error: 'Please enter a valid email' });
});

test('valid input is trimmed and email lowercased', () => {
  assert.deepEqual(validateContact(good), {
    ok: true,
    data: { name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'Hello there' },
  });
});

test('email body carries sender and message', () => {
  const { subject, text } = formatContactEmail({ name: 'Jane', email: 'jane@example.com', subject: 'Hi', message: 'Hello' });
  assert.equal(subject, '[usmotorcycleclubs.com] Hi');
  assert.match(text, /From: Jane <jane@example\.com>/);
  assert.match(text, /Hello/);
});

test('correction link and prefill are derived from club name and slug', () => {
  assert.equal(correctionHref('Iron Order MC', 'iron-order-mc'), '/contact?club=Iron+Order+MC&slug=iron-order-mc');
  const prefill = correctionPrefill('Iron Order MC', 'iron-order-mc');
  assert.equal(prefill.subject, 'Correction: Iron Order MC');
  assert.match(prefill.message, /\/clubs\/iron-order-mc/);
});

test('line breaks in subject are rejected to prevent header injection', () => {
  assert.deepEqual(validateContact({ ...good, subject: 'Hi\r\nBcc: x@y.z' }), {
    ok: false,
    error: 'Please remove line breaks from the subject',
  });
});

test('line breaks in name are rejected', () => {
  assert.deepEqual(validateContact({ ...good, name: 'Jane\nDoe' }), {
    ok: false,
    error: 'Please remove line breaks from the name',
  });
});

test('honeypot wins over an oversized name', () => {
  assert.deepEqual(validateContact({ ...good, name: 'x'.repeat(500), website: 'http://spam' }), { ok: 'honeypot' });
});

test('email with surrounding spaces is trimmed and accepted', () => {
  const result = validateContact({ ...good, email: ' Jane@Example.com ' });
  assert.equal(result.ok, true);
  if (result.ok === true) assert.equal(result.data.email, 'jane@example.com');
});

test('email with an internal line break is rejected', () => {
  assert.deepEqual(validateContact({ ...good, email: 'jane@example.com\r\nBcc: x@y.z' }), {
    ok: false,
    error: 'Please enter a valid email',
  });
});

test('correctionHref percent-encodes ampersand and hash in the club name', () => {
  const href = correctionHref('A&b=c#x', 'a-b');
  const query = href.slice(href.indexOf('?') + 1);
  const clubValue = query.split('&')[0];
  assert.equal(clubValue, 'club=A%26b%3Dc%23x');
  assert.ok(!href.includes('#'));
  assert.equal(query.split('&').length, 2);
});
