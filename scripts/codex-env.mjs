import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('../', import.meta.url))
const task = process.argv[2]
try {
  if (!['setup', 'check', 'build', 'dev'].includes(task) || process.argv.length !== 3) {
    throw new Error('Usage: node scripts/codex-env.mjs setup|check|build|dev')
  }
  const major = readFileSync(join(root, '.nvmrc'), 'utf8').trim()
  if (process.versions.node.split('.')[0] !== major) throw new Error(`Use Node.js ${major}.x; found ${process.versions.node}.`)
  if (readdirSync(root).map(name => name.toLowerCase()).some(name => name === '.env' || (name.startsWith('.env.') && name !== '.env.example'))) {
    throw new Error('Local environment file detected. Use a clean worktree without .env files. No file was read or changed.')
  }
  const env = { ...process.env }
  for (const key of Object.keys(env)) {
    if (/^(NEXT_PUBLIC_|RESEND_|CONTACT_|VERCEL|SUPABASE_|DATABASE_URL$|PG)/i.test(key)) delete env[key]
  }
  delete env.NODE_ENV
  env.NEXT_TELEMETRY_DISABLED = '1'
  // Preserve the default canonical origin: existing tests assert that origin.
  const run = (args, capture = false) => {
    const result = spawnSync('pnpm', args, { cwd: root, env, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit', shell: process.platform === 'win32' })
    if (result.error) throw new Error(`Cannot launch pnpm 10: ${result.error.message}`)
    if (result.status !== 0) process.exit(result.status ?? 1)
    return result.stdout?.trim()
  }
  const version = run(['--version'], true)
  if (!version?.startsWith('10.')) throw new Error(`Use pnpm 10; found ${version}.`)
  if (task === 'setup') {
    run(['install', '--frozen-lockfile', '--ignore-scripts'])
  } else if (task === 'check') {
    for (const command of ['test', 'typecheck', 'lint:app', 'build']) run([command])
  } else {
    run([task])
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
