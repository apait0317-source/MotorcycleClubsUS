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
