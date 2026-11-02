# Codex development

Read [CLAUDE.md](CLAUDE.md) for the shared architecture, commands and project rules.
Use [.codex/README.md](.codex/README.md) for the development environment setup.

Keep the existing static architecture. Use Node 22 and pnpm 10. The development
runner is `node scripts/codex-env.mjs setup|check|build|dev`. Use no production
credentials or local `.env` files. Validation preserves the four commands in
CLAUDE.md, including `lint:app`. Do not run production health checks as bootstrap.
