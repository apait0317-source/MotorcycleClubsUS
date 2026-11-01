import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createContext, runInContext } from 'node:vm';
import type { ReactElement } from 'react';

const previous = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123456';
// Load the real component after setting the build-time public configuration.
const GoogleAnalytics = require('@/components/GoogleAnalytics').default;
if (previous === undefined) delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
else process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = previous;

function runInitialization(initial: unknown[] = []) {
  const node = GoogleAnalytics() as ReactElement<{ children: ReactElement<{ children?: string }>[] }>;
  const inline = node.props.children.find(child => typeof child.props.children === 'string');
  assert.ok(inline?.props.children);
  const global = { dataLayer: initial } as { dataLayer: unknown[]; window?: unknown };
  global.window = global;
  runInContext(inline.props.children, createContext(global));
  const commands = global.dataLayer.map(command => Array.from(command as ArrayLike<unknown>));
  return { global, commands: JSON.parse(JSON.stringify(commands)) as unknown[][] };
}

test('worldwide denied consent defaults precede any Analytics configuration command', () => {
  const { commands } = runInitialization();
  const consentIndex = commands.findIndex(command => command[0] === 'consent' && command[1] === 'default');
  const configIndex = commands.findIndex(command => command[0] === 'config');
  assert.ok(consentIndex >= 0, 'No default consent command was emitted');
  assert.ok(configIndex > consentIndex, 'Measurement was configured before consent defaults');
  const state = commands[consentIndex][2] as Record<string, unknown>;
  for (const key of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']) assert.equal(state[key], 'denied');
  assert.equal(Object.hasOwn(state, 'region'), false, 'Worldwide defaults must not leave countries outside a regional rule');
  assert.equal(state.wait_for_update, 500);
});

test('initialization preserves CMP commands without fabricating a consent grant', () => {
  const previous = [['consent', 'update', { analytics_storage: 'denied' }]];
  const { global, commands } = runInitialization(previous);
  assert.equal(global.dataLayer, previous);
  assert.deepEqual(commands[0], ['consent', 'update', { analytics_storage: 'denied' }]);
  assert.equal(commands.filter(command => command[0] === 'consent' && command[1] === 'update').length, 1);
  assert.deepEqual(commands.at(-1), ['config', 'G-TEST123456']);
});

test('consent initialization is scheduled before loading the measurement library', () => {
  const node = GoogleAnalytics() as ReactElement<{ children: ReactElement<{ children?: string; src?: string }>[] }>;
  const scripts = node.props.children;
  const initialization = scripts.findIndex(script => typeof script.props.children === 'string');
  const library = scripts.findIndex(script => typeof script.props.src === 'string');
  assert.ok(initialization >= 0 && library > initialization);
});
