# MotorcycleClubsUS development environment

Keep this environment separate from RetroPizzaHut. Read [CLAUDE.md](../CLAUDE.md)
for shared project guidance. The static JSON architecture, deployment configuration,
application code, lockfile and production settings are unchanged.

Use Node.js 22.x (`.nvmrc`, matching the existing package engines) and pnpm 10.
Install pnpm 10 before setup, for example with an available Corepack installation:
`corepack enable pnpm` followed by `corepack prepare pnpm@10 --activate`.
Enabling shims requires a writable tool installation; otherwise use the
environment's supported pnpm provisioning path. Do not use npm to install this repository.

| Task | Command |
| --- | --- |
| Setup | `node scripts/codex-env.mjs setup` |
| Validate | `node scripts/codex-env.mjs check` |
| Build | `node scripts/codex-env.mjs build` |
| Dev | `node scripts/codex-env.mjs dev` |

Run `node --test .codex/environment.test.mjs` to validate the bootstrap guards.
Setup enforces Node 22 and pnpm 10, then runs
`pnpm install --frozen-lockfile --ignore-scripts`. The check runs the established
`pnpm test`, `pnpm typecheck`, `pnpm lint:app`, and `pnpm build`, in that order.
Install scripts are disabled; the locked platform packages provide the native
Sharp and Next.js binaries. Do not replace `lint:app` with the broader `lint`.

The runner refuses `.env` and `.env.*` files except `.env.example`, without reading
or deleting them. It removes inherited public, email, contact, deployment and
database service variables. The existing default canonical URL stays intact for
tests. A canonical URL is metadata, not a network health check. There is no
database setup, login, scraping, source monitoring or production health request.
Local forms have no email delivery. Production ad and analytics values are not
imported. The runner cannot protect arbitrary commands outside this entry point.

## Codex settings to apply

No account environment was inspected, created or published by these files.
For cloud tasks, select only `apait0317-source/MotorcycleClubsUS`, pin Node to 22,
provision pnpm 10, and configure manual setup and maintenance scripts:

```sh
corepack enable pnpm
corepack prepare pnpm@10 --activate
node scripts/codex-env.mjs setup
```

If Corepack is unavailable, provision pnpm 10 through the environment's supported
runtime setup before running the command. Leave secrets and application variables
empty. Dependency installation needs registry.npmjs.org. Builds also need
fonts.googleapis.com and fonts.gstatic.com for the existing Inter font. Allow
those font hosts during agent build checks, or use a supported prepopulated font
cache. In environments with TLS interception, preserve the environment's trusted
certificate configuration. Turbopack can use system trust with
`NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`; do not disable certificate
verification. Select the implementation
branch to test these commands before merge.

In the Windows desktop app, open this project and select Codex. Configure the
project's local environment in Settings, with Node 22 and pnpm 10 available in
its execution terminal (or within WSL when using WSL). Set the setup command above
and add Check, Build and Dev actions from the table. These scripts validate the
toolchain; they do not install or switch Node globally. Run setup and Check in a
fresh worktree. Let the desktop app generate its `.codex` configuration file,
then review local paths and secrets before committing that generated file.
Selecting, publishing or sharing the account environment requires access to
the app/settings. Do not copy another project's generated environment file.

Official references: [local environments](https://learn.chatgpt.com/docs/environments/local-environment)
and [Codex cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environment).

## Validation, November 1, 2026

Validated against main commit `a204b36`, using Node 22.23.4 and pnpm 10.34.9.
Setup completed a clean frozen installation with install scripts disabled.
All seven bootstrap safety tests, `pnpm typecheck`, and `pnpm lint:app` passed.
The build passed and prerendered 3,442 pages with system certificate trust enabled.

The sandbox refused the Unix socket created by the tsx CLI, so the unmodified
`pnpm test` command stopped with `listen EPERM`. The same 202 tests all passed
using `node --import tsx --test 'tests/**/*.test.ts'` under Node 22. This is
supplementary evidence, not a passing run of the exact four-command Check action.
Run that action in the target Codex environment before merging. No application
test command was changed to accommodate this sandbox. Windows execution and
account publication remain unverified. No production service was contacted.
