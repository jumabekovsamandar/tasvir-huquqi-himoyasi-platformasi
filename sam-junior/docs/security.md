# SAM JUNIOR — Security

Security is an architecture requirement, not a feature. These rules bind all
current and future code. Violating any of them is a bug, regardless of
whether "it works".

## Secrets

- No secrets in source code, commit history, or logs — ever.
- API keys live in `.env` (gitignored) or OS secure storage (Windows
  Credential Manager, planned for the AI-provider phase). `.env.example`
  documents names only, never values.
- The frontend never receives a secret. Vite exposes only `VITE_*`-prefixed
  variables (`vite.config.ts` pins `envPrefix`), so secrets must never use
  that prefix. AI calls that need keys happen in Rust, not in the webview.

## Execution boundary

- The language model **never** executes unrestricted shell commands. All
  computer actions go through a typed tool registry (see
  `docs/permissions.md`): named tool → typed schema → validation →
  permission check → handler → verification → audit log.
- Tool inputs are validated in Rust before touching the OS. File paths are
  normalized and checked against configured allowed roots; path traversal
  (`..`, junction tricks) must be rejected with tests proving it.
- Application launching uses a known-app registry / Start Menu discovery /
  configured paths — never a model-composed command line.

## Tauri surface

- `src-tauri/capabilities/default.json` grants `core:default` only. Every
  added capability (fs, shell, global shortcut, tray…) is an explicit,
  reviewed diff.
- CSP is set in `tauri.conf.json` (`script-src 'self'`; connect limited to
  self + IPC). Keep it strict; loosen only with a written reason.
- No remote content in the webview. The UI is fully local.

## Privacy

- Local-first: conversations, memories, settings and logs stay on disk in
  the app data directory unless a feature explicitly requires a provider
  call, and the user knows which data leaves the machine.
- **Private Mode** (future, first-class): no conversation persistence, no
  memory writes, no semantic indexing, no content in activity logs.
- **Screen capture** only on explicit request, with a visible indicator;
  screenshots are not stored unless the user asks.
- **Microphone**: push-to-talk first; never always-on cloud streaming;
  wake-word (if ever) must be local.
- Logs must never contain message content, file contents, or secrets. The
  tool layer redacts parameters before logging.

## Databases and data at rest

- SQLite in the per-user app data dir (`%APPDATA%\app.samjunior.desktop`),
  protected by OS user-account boundaries. Field-level encryption for
  especially sensitive memory records is on the roadmap before any
  cloud-sync feature is even considered.

## Dependencies

- Keep them minimal; prefer std/first-party. Adding a dependency requires a
  stated reason (see decision log in `docs/architecture.md`).
- Current third-party surface (Rust): tauri, rusqlite (bundled SQLite),
  serde/serde_json, thiserror, tracing stack. (JS): react, react-dom,
  @tauri-apps/api + build tooling.

## Forbidden, permanently

- Disabling Windows security features or asking the user to disable
  antivirus.
- Executing downloaded files automatically.
- Exposing local automation endpoints to the network.
- "Temporary" bypasses of the permission engine.
