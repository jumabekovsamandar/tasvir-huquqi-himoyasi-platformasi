# SAM JUNIOR — Architecture

## Overview

SAM JUNIOR is a Windows-first Tauri 2 desktop application with a Rust core
and a React/TypeScript frontend. The design goal is a modular personal
intelligence system where every capability (AI providers, memory, tools,
permissions) is a replaceable module, and where nothing critical depends on
a UI being present.

## Conceptual pipeline (target)

```
USER
 └─ INPUT LAYER            text · voice · shortcut
     └─ SAM CORE           intent, context selection
         └─ CONTEXT+MEMORY retrieval (user-controlled)
             └─ PLANNER    short execution plan for multi-step tasks
                 └─ PERMISSION ENGINE   GREEN / YELLOW / RED
                     └─ TOOL EXECUTION  typed tool registry only
                         └─ VERIFICATION did it actually happen?
                             └─ RESPONSE honest result, streaming
                                 └─ ACTIVITY LOG  auditable record
```

The language model never executes OS operations directly. It can only
request tools from a typed registry; the permission engine and verification
sit between request and effect.

## Physical layout

```
sam-junior/
├── apps/desktop/
│   ├── src/            React frontend (strict TS, Vite, plain-CSS tokens)
│   └── src-tauri/      Tauri shell: commands, state, logging, lifecycle
├── packages/
│   └── core/           sam-core crate: SQLite, migrations, settings
├── docs/
└── scripts/
```

Two workspaces overlap deliberately:

- **Cargo workspace** (`Cargo.toml`): `packages/core` + `apps/desktop/src-tauri`.
- **pnpm workspace** (`pnpm-workspace.yaml`): `apps/*`.

Planned crates (created in their phase, never as empty stubs):
`packages/ai` (provider traits + first implementation), `packages/memory`,
`packages/tools` (tool registry + handlers), `packages/permissions`,
`packages/shared` (only if types must be shared across crates).

## Layer responsibilities

### Tauri shell (`apps/desktop/src-tauri`)

Thin by rule. Owns: window lifecycle, path resolution (app data/log dirs),
logging initialization, Tauri state, and the IPC command surface. Each
command validates input, delegates to `sam-core`, and maps errors to
`CommandError { code, message }` — the single error shape the frontend sees.

### Core (`packages/core`)

Everything that must work headless: database open/configure (WAL,
foreign keys), append-only migrations, settings store (JSON values,
defaults overlay). Unit-tested with `cargo test`; no Tauri types anywhere
in this crate, which keeps it portable and testable in CI.

### Frontend (`apps/desktop/src`)

React 19 + strict TypeScript. Talks to the shell only through typed
wrappers in `src/lib/ipc.ts`; TS mirrors of Rust types live in
`src/types.ts`. Detects a missing Tauri runtime and says so instead of
rendering dead controls. UI text is bilingual (uz/en) via a `STRINGS`
table; Uzbek is the default.

## Key decisions (log)

| # | Decision | Reason |
|---|---|---|
| 1 | Tauri 2 over Electron | Native footprint, Rust boundary for security-critical code, first-class Windows support |
| 2 | `sam-core` split from the shell | Headless testability; the shell stays replaceable |
| 3 | rusqlite `bundled` | No system SQLite dependency on Windows; identical version everywhere |
| 4 | Append-only SQL migrations in code | Simple, reviewable, no external migration tool |
| 5 | Settings as JSON values in one table | Flexible without schema churn; typed keys listed in `settings::keys` |
| 6 | Plain CSS tokens, no Tailwind (Phase 0/1) | Tiny surface so far; add Tailwind only if component count justifies it |
| 7 | `CommandError { code, message }` for all IPC | Stable machine-readable failures; honest user-facing messages |
| 8 | Launch counter written at startup | Cheap, real proof of persistence across restarts (Phase 0 acceptance) |
| 9 | SAM JUNIOR lives in `sam-junior/` inside the ImageRights repo | The repo already hosts the ImageRights platform; nesting preserves it untouched |

## AI provider abstraction (Phase 2, design contract)

Traits in a future `packages/ai`:
`ChatProvider` (streaming + cancellation), `VisionProvider`,
`SpeechToTextProvider`, `TextToSpeechProvider`, `EmbeddingProvider`.
Rules: implementations are swappable; API keys live in OS-level secure
storage or `.env` (backend only); the frontend never sees a key; core
never imports a vendor SDK directly.

## Verified-launch policy

A phase's "app runs" claim must come from actually running it. On Linux dev
containers that means `xvfb-run` + reading startup/shutdown logs; on
Windows, launching `pnpm dev` and exercising the UI. See
`docs/PROJECT_STATUS.md` for what was verified where.
