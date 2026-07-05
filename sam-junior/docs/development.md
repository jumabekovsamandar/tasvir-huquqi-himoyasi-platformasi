# SAM JUNIOR — Development Guide

## Prerequisites

See `README.md` for full Windows setup. Short version: Rust (MSVC
toolchain), C++ Build Tools, Node 20+, pnpm, WebView2.

On Linux containers (CI / Claude Code web): additionally
`libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev
librsvg2-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev patchelf`, plus
`xvfb-run` to launch the app headlessly.

## Everyday commands (run from `sam-junior/`)

| Command | What it does |
|---|---|
| `pnpm install` | install JS dependencies |
| `pnpm dev` | full dev loop: Vite + Rust compile + app window |
| `pnpm typecheck` | strict TypeScript check |
| `pnpm build:frontend` | tsc + production Vite build |
| `pnpm build:app` | `tauri build` → NSIS installer (Windows) |
| `cargo test --workspace` | all Rust tests |
| `cargo build -p sam-junior-desktop` | compile the shell without running |
| `python3 scripts/generate_icons.py` | regenerate icons (Pillow) |

Headless launch check (Linux):

```bash
# terminal 1                           # terminal 2
cd apps/desktop && pnpm dev            xvfb-run -a ./target/debug/sam-junior-desktop
```

Watch stdout for `database initialized` and `SAM JUNIOR ready`.
`WEBKIT_DISABLE_COMPOSITING_MODE=1 WEBKIT_DISABLE_DMABUF_RENDERER=1` helps
on GPU-less containers.

## Conventions

- **Rust**: small focused modules; errors via `thiserror` enums; no
  `unwrap()` outside tests; `tracing` for logs (no `println!`).
- **Migrations**: append-only in `packages/core/src/migrations.rs`. Never
  edit a shipped migration; add the next version.
- **IPC**: commands live in `src-tauri/src/commands.rs`, return
  `Result<T, CommandError>`; keep TS mirrors in `apps/desktop/src/types.ts`
  in sync in the same commit.
- **TypeScript**: strict mode is non-negotiable; UI strings go through the
  bilingual `STRINGS` table (uz first, en second).
- **Styling**: design tokens in `src/styles.css`; calm dark palette; no
  neon, no constant animation.
- **Tests**: colocated `#[cfg(test)]` modules in Rust; every new core
  behavior lands with a test.

## Session hygiene

- Logical commits with descriptive messages.
- End every meaningful session by updating `docs/PROJECT_STATUS.md`
  (phase, completed work, tests run, known issues, next action).
- New architectural decisions go into the decision log in
  `docs/architecture.md`.

## Environment variables

| Variable | Purpose |
|---|---|
| `SAM_LOG` | tracing filter override, e.g. `debug` or `info,sam_core=trace` |

Secrets (later phases) go in `.env` — see `.env.example` and
`docs/security.md`.
