## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

<!-- DOPPLER-POLICY v1 -->
## Secrets & Doppler — single source of truth (MANDATORY, 21/07/2026)

Doppler is the ONE source of truth for every secret. NEVER put a secret's canonical copy in
Render env, Cloudflare `wrangler`/Worker secret stores, `.env`, `CREDENTIALS.local.md`, or
source code.
- **Render service →** run under `doppler run -- <cmd>`; only `DOPPLER_TOKEN` lives in Render env.
- **CF Worker →** Doppler is canonical; push at deploy via `wrangler secret put` from Doppler.
- **CF Pages →** build/runtime env driven from Doppler at deploy.
- **Add/rotate a secret:** set it in this repo's Doppler project (`vci-<app>`; shared creds in
  `vci-shared`) FIRST, then redeploy/push. Never add it straight to platform env or `.env`.

Full policy + patterns: global `~/.claude/CLAUDE.md` → §Secrets & Doppler.
<!-- /DOPPLER-POLICY -->
