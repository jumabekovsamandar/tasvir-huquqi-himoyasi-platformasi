# SAM JUNIOR

A private, personal AI assistant for Windows. Not a chatbot wrapper — a
local-first, modular personal intelligence system with explicit user control
over memory, permissions and every computer action.

**Owner:** Sam · **Languages:** Uzbek (Latin) + English · **Platform:** Windows-first

**Current state: Phase 0 — foundation.** The app launches, initializes a local
SQLite database with migrations, and persists settings across restarts. No AI
features yet — see [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) for the
authoritative progress record.

---

## Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2 (Rust) |
| Frontend | React 19 + TypeScript (strict) + Vite |
| Core logic | Rust crate `sam-core` (`packages/core`) |
| Database | SQLite (bundled, WAL mode) with versioned migrations |
| Logging | `tracing` → stdout + daily-rotated file in the app log dir |

## Repository layout

```
sam-junior/
├── apps/desktop/          # Tauri app
│   ├── src/               # React frontend
│   └── src-tauri/         # Rust shell: commands, state, logging
├── packages/core/         # sam-core: database, migrations, settings
├── docs/                  # architecture, security, permissions, status
├── scripts/               # dev utilities (icon generation)
├── Cargo.toml             # Rust workspace
├── pnpm-workspace.yaml    # JS workspace
└── .env.example
```

Future phases add `packages/ai`, `packages/memory`, `packages/tools`,
`packages/permissions` — they are created when they have real content, never
as empty placeholders.

## Windows setup (from zero)

1. **Install Rust** — <https://rustup.rs> → run `rustup-init.exe`, accept the
   default `x86_64-pc-windows-msvc` toolchain.
2. **Install Microsoft C++ Build Tools** — <https://visualstudio.microsoft.com/visual-cpp-build-tools/>
   → select the "Desktop development with C++" workload. (Required by Rust MSVC.)
3. **Install Node.js 20+** — <https://nodejs.org> (LTS).
4. **Install pnpm** — `npm install -g pnpm`
5. **WebView2** — pre-installed on Windows 10 (build 1803+) and Windows 11.
   If missing: <https://developer.microsoft.com/en-us/microsoft-edge/webview2/>
6. **Clone and enter the project**
   ```powershell
   git clone <repo-url>
   cd tasvir-huquqi-himoyasi-platformasi\sam-junior
   ```

No administrator rights are needed beyond the tool installers themselves.

## Run (development)

```powershell
cd sam-junior
pnpm install
pnpm dev          # = tauri dev: starts Vite + compiles Rust + opens the window
```

First Rust compile takes several minutes; later runs are incremental.

## Test

```powershell
cargo test --workspace          # Rust: database, migrations, settings
pnpm typecheck                  # TypeScript strict check
```

## Build a Windows installer

```powershell
pnpm build:app    # = tauri build → NSIS installer in apps/desktop/src-tauri/target/release/bundle/nsis/
```

## Where data lives

| Item | Windows path |
|---|---|
| Database | `%APPDATA%\app.samjunior.desktop\sam-junior.db` |
| Logs | `%LOCALAPPDATA%\app.samjunior.desktop\logs\` |

Delete the database file to reset the app to first-launch state (settings and
future conversations/memories live there).

## Configuration

Copy `.env.example` to `.env` when later phases require secrets (AI provider
keys). **Never commit `.env`. Never put secrets in frontend code or `VITE_`
variables.** See [`docs/security.md`](docs/security.md).

## Documentation

- [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md) — current phase, verified state, next steps
- [`docs/architecture.md`](docs/architecture.md) — system design and decisions
- [`docs/security.md`](docs/security.md) — security boundaries and rules
- [`docs/permissions.md`](docs/permissions.md) — GREEN/YELLOW/RED action model
- [`docs/development.md`](docs/development.md) — workflow, commands, conventions
- [`CLAUDE.md`](CLAUDE.md) — context for AI-assisted development sessions
