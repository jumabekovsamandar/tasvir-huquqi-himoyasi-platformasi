# CLAUDE.md — SAM JUNIOR

Context for AI-assisted development sessions. Read this fully before changing
code. The authoritative progress record is `docs/PROJECT_STATUS.md` — update
it at the end of every meaningful session.

## Product vision

SAM JUNIOR is a **private personal AI assistant for one user (Sam)** on
Windows: text + voice conversation in Uzbek (Latin) and English, explicit
user-controlled memory, project awareness (main project: ImageRights),
local file search, safe app launching, opt-in screen inspection, a
GREEN/YELLOW/RED permission engine, and a transparent activity log.
Local-first privacy. Calm, precise, minimal presence — original identity,
no copyrighted assets or imitations.

It is NOT a generic chatbot, not a ChatGPT wrapper, not a web app.

## Architecture

```
USER → INPUT → SAM CORE → CONTEXT+MEMORY → PLANNER → PERMISSION ENGINE
     → TOOL EXECUTION → VERIFICATION → RESPONSE → ACTIVITY LOG
```

- **Shell:** Tauri 2. Rust code in `apps/desktop/src-tauri` stays thin:
  commands, state, logging, lifecycle.
- **Core:** `packages/core` (`sam-core` crate) owns database, migrations,
  settings — everything testable without a UI. New domain logic (memory,
  tools, permissions, providers) gets its own crate under `packages/`,
  created **when it has real content**, never as an empty stub.
- **Frontend:** React 19 + strict TypeScript + Vite in `apps/desktop/src`.
  Plain CSS design tokens (`src/styles.css`); revisit Tailwind only if
  component count makes it clearly worth it.
- **Database:** SQLite via rusqlite (bundled), WAL mode. Migrations are
  append-only in `packages/core/src/migrations.rs`; never edit a shipped
  migration.
- **AI providers (Phase 2+):** must sit behind traits (ChatProvider,
  VisionProvider, SpeechToTextProvider, TextToSpeechProvider,
  EmbeddingProvider) in a `packages/ai` crate. No direct vendor coupling in
  core or frontend.
- **IPC contract:** every Tauri command returns `Result<T, CommandError>`
  where `CommandError = { code, message }` (`src-tauri/src/commands.rs`).
  TS mirrors live in `apps/desktop/src/types.ts` — keep both sides in sync.

## Commands

Run from `sam-junior/`:

```
pnpm install                 # JS deps
pnpm dev                     # tauri dev (Vite + Rust + window)
pnpm typecheck               # strict tsc
pnpm build:frontend          # tsc + vite build
pnpm build:app               # tauri build (Windows installer)
cargo test --workspace       # Rust tests
cargo build -p sam-junior-desktop   # compile shell without running
python3 scripts/generate_icons.py   # regenerate icons (needs Pillow)
```

Linux dev containers need: `libwebkit2gtk-4.1-dev libgtk-3-dev
libayatana-appindicator3-dev librsvg2-dev libsoup-3.0-dev
libjavascriptcoregtk-4.1-dev patchelf`, and `xvfb-run` for headless launch.

## Current phase

**Phase 0 complete** — see `docs/PROJECT_STATUS.md` for verified detail.
Next: **Phase 1 — original interface** (orb states, global shortcut,
Command Center shell).

## Development rules

1. Build real features; **never fake functionality or display fake data**.
2. Never claim an action succeeded without verifying it.
3. Preserve working code; no rewrites without strong technical reason.
4. Every phase must end with: builds passing, tests passing, docs updated.
5. Keep files focused; no giant files; no duplicated logic.
6. Strict TypeScript everywhere; typed Rust errors (`thiserror`).
7. Uzbek (Latin) is the primary UI language, English secondary — both
   always supported (see `STRINGS` pattern in `App.tsx`).
8. The user's name/profile is **editable settings data**, never hardcoded
   logic (`sam-core::settings`).
9. This repo also contains the ImageRights web platform (`/backend`,
   `/backend-v2`, `/frontend` at repo root). **Do not touch it** from
   SAM JUNIOR work.

## Security boundaries (never violate)

- No secrets in source, commits, logs, or frontend (`VITE_*` is public).
- The model must NEVER execute unrestricted shell commands. All computer
  actions go through the typed tool registry with permission checks
  (Phase: Windows Action System; design in `docs/permissions.md`).
- Validate and normalize all tool inputs, especially file paths
  (path-traversal checks) before any filesystem operation.
- RED-risk actions (delete, send, publish, install, pay) always require
  explicit confirmation with concrete wording — never "Continue?".
- No continuous screen capture or always-on cloud microphone. Screen
  vision and voice are explicit, visibly indicated, opt-in features.
- Private Mode must persist nothing (no conversations, memories, or
  content logs).
- Tauri capabilities (`src-tauri/capabilities/`) stay minimal; every new
  permission is a reviewed, deliberate addition.

## Testing requirements

- `sam-core` logic: unit tests colocated in the crate (`cargo test`).
- Tool boundaries (future): integration tests per tool handler.
- Before declaring a phase done: app builds, launches, closes cleanly;
  critical path exercised; failure states handled; docs updated
  (Definition of Done in the master prompt).

## Never do

- Never mark unfinished work complete or report unverified success.
- Never bypass the permission engine "temporarily".
- Never add heavy dependencies without justification in writing.
- Never edit shipped migrations; append new ones.
- Never store or log conversation content while Private Mode is active.
- Never imitate copyrighted characters, voices, or dialogue.
- Never commit `.env`, keys, or personal data.
