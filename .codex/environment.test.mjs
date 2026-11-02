import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'codex-env-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'scripts'))
  mkdirSync(join(root, 'bin'))
  copyFileSync(new URL('../scripts/codex-env.mjs', import.meta.url), join(root, 'scripts/codex-env.mjs'))
  writeFileSync(join(root, '.nvmrc'), process.versions.node.split('.')[0])
  const cli = join(root, 'bin/pnpm.cjs')
  writeFileSync(cli, `
    const args = process.argv.slice(2);
    if (args[0] === '--version') console.log(process.env.TEST_PNPM_VERSION || '10.34.0');
    else {
      console.log(JSON.stringify({args, email: process.env.RESEND_API_KEY ?? null, ads: process.env.NEXT_PUBLIC_ADSENSE_ID ?? null}));
      if (args[0] === process.env.TEST_FAIL_COMMAND) process.exit(17);
    }
  `)
  if (process.platform === 'win32') {
    writeFileSync(join(root, 'bin/pnpm.cmd'), `@"${process.execPath}" "${cli}" %*\r\n`)
  } else {
    writeFileSync(join(root, 'bin/pnpm'), `#!/bin/sh\nexec '${process.execPath}' '${cli}' "$@"\n`, { mode: 0o755 })
  }
  return { root, run: (task, extra = {}) => spawnSync(process.execPath, [join(root, 'scripts/codex-env.mjs'), task], {
    encoding: 'utf8', env: {
      PATH: join(root, 'bin'), SystemRoot: process.env.SystemRoot,
      RESEND_API_KEY: 'fake-email-key', NEXT_PUBLIC_ADSENSE_ID: 'fake-publisher', ...extra
    }
  }) }
}

test('setup uses a frozen lockfile without install scripts or production variables', (t) => {
  const { run } = fixture(t)
  const result = run('setup')
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(JSON.parse(result.stdout), {
    args: ['install', '--frozen-lockfile', '--ignore-scripts'], email: null, ads: null
  })
})

test('check preserves the four established commands in order', (t) => {
  const { run } = fixture(t)
  const result = run('check')
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(result.stdout.trim().split('\n').map(line => JSON.parse(line).args), [
    ['test'], ['typecheck'], ['lint:app'], ['build']
  ])
})

test('check stops on the first failed command', (t) => {
  const { run } = fixture(t)
  const result = run('check', { TEST_FAIL_COMMAND: 'typecheck' })
  assert.equal(result.status, 17)
  assert.equal(result.stdout.trim().split('\n').length, 2)
})

test('rejects pnpm 11 before installation', (t) => {
  const { run } = fixture(t)
  const result = run('setup', { TEST_PNPM_VERSION: '11.0.0' })
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Use pnpm 10/)
  assert.equal(result.stdout, '')
})

test('rejects local environment files without reading their values', (t) => {
  const { root, run } = fixture(t)
  writeFileSync(join(root, '.env.local'), 'RESEND_API_KEY=fake-do-not-print')
  const result = run('setup')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /environment file/)
  assert.doesNotMatch(result.stderr, /fake-do-not-print/)
  assert.equal(result.stdout, '')
})

test('rejects the wrong Node major before installation', (t) => {
  const { root, run } = fixture(t)
  writeFileSync(join(root, '.nvmrc'), '99')
  const result = run('setup')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Node.js 99/)
  assert.equal(result.stdout, '')
})

test('rejects mixed-case environment filenames used on Windows', (t) => {
  const { root, run } = fixture(t)
  writeFileSync(join(root, '.ENV.LOCAL'), 'RESEND_API_KEY=fake-do-not-print')
  const result = run('setup')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /environment file/)
  assert.equal(result.stdout, '')
})
