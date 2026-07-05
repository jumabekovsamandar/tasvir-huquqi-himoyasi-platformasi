# SAM JUNIOR — Project Status

> Authoritative development progress record. Update at the end of every
> meaningful session. Never rely on chat history alone.

**Last updated:** 2026-07-05
**Current phase:** Phase 0 — foundation → **complete** (with one Windows
verification item outstanding, see Known issues)
**Next phase:** Phase 1 — original SAM JUNIOR interface

---

## Environment audit (2026-07-05)

Development ran in a **Linux cloud container** (Claude Code remote), not on
Sam's Windows machine. Windows-specific verification items are tracked
explicitly below.

| Component | Found |
|---|---|
| OS (dev container) | Ubuntu 24.04.4, x86_64, 4 CPU, 15 GB RAM |
| Node.js | v22.22.2 |
| npm / pnpm / yarn | 10.9.7 / 10.33.0 / 1.22.22 |
| Git | 2.43.0 |
| Rust / Cargo | 1.94.1 |
| Python | 3.11.15 (+ Pillow installed for icon generation) |
| WebView2 / MSVC Build Tools | n/a on Linux — required on Windows (README covers setup) |
| Tauri Linux deps | installed during session: libwebkit2gtk-4.1-dev, libgtk-3-dev, libayatana-appindicator3-dev, librsvg2-dev, libsoup-3.0-dev, libjavascriptcoregtk-4.1-dev, patchelf |

Repository audit: the repo already hosts the **ImageRights web platform**
(`/frontend` Next.js, `/backend` + `/backend-v2` NestJS, `/docs`). It was
left untouched; SAM JUNIOR lives entirely in `/sam-junior`.

## Phase 0 — what was built

- Cargo + pnpm workspaces under `sam-junior/`.
- `packages/core` (`sam-core`): SQLite (rusqlite bundled, WAL,
  foreign keys), append-only migration runner (migration 001: settings
  table), settings store (JSON values, defaults overlay, typed keys),
  structured errors (`thiserror`), launch counter as a real persistence
  probe. 7 unit tests.
- `apps/desktop/src-tauri`: Tauri 2 shell — lifecycle, app-data/log path
  resolution, `tracing` logging (stdout + daily-rotated file), managed
  state, 4 IPC commands (`health_check`, `get_setting`, `set_setting`,
  `list_settings`) all returning typed `CommandError` on failure. Minimal
  capability (`core:default`), strict CSP. Original procedurally-generated
  orb icons (`scripts/generate_icons.py`).
- `apps/desktop/src`: React 19 + strict TS + Vite status UI — health card
  (version, DB state, schema version, launch count, data dir), settings
  card (language uz/en, preferred name) persisting through IPC, honest
  error banners, graceful "no Tauri runtime" state. Bilingual strings,
  Uzbek default. Dark calm design tokens, static orb mark.
- Docs: README (exact Windows setup), CLAUDE.md (session context),
  architecture.md (incl. decision log), security.md, permissions.md
  (GREEN/YELLOW/RED design contract), development.md, this file.
- Root `.gitignore` extended for Rust artifacts; `.env.example` added.

## Verification record (this session, Linux container)

| Check | Result |
|---|---|
| `cargo test -p sam-core` | ✅ 7/7 passed (fresh DB + migration, idempotent reopen, settings roundtrip + persistence across reopen, launch counter, defaults overlay) |
| `pnpm build` (strict tsc + vite) | ✅ clean, no errors |
| `cargo build -p sam-junior-desktop` | ✅ success (1m30s debug) |
| Headless launch #1 (`xvfb-run`, Vite dev server up) | ✅ log: migration applied → `database ready schema_version=1` → `launch_count=1` → `SAM JUNIOR ready`; WebView instantiated (WebKit cache dirs created); no errors |
| Headless launch #2 | ✅ no migration re-run, `launch_count=2` → **settings persist across restarts** |
| File logging | ✅ `logs/sam-junior.log.2026-07-05` written, no ANSI noise |
| Clean shutdown via window close | ⚠️ not verifiable headless (processes were SIGTERM-killed); verify on Windows |

## Phase 0 acceptance criteria

- [x] App starts (verified headless on Linux; **re-verify on Windows**)
- [x] Database initializes with migrations
- [x] Settings persist after restart (unit tests + launch counter across real launches)
- [x] No critical console errors (only harmless libEGL software-rendering warnings from the GPU-less container)
- [ ] App closes cleanly via UI — needs a real display; **verify on Windows** (`pnpm dev`, close window, check log for "SAM JUNIOR shut down cleanly")

## Known issues

1. **Windows-native run not yet exercised.** All verification ran on Linux.
   First action on Sam's machine: follow README setup, run `pnpm dev`,
   confirm window opens, settings survive restart, and closing the window
   logs a clean shutdown.
2. `bundle.targets` is `["nsis"]` — `pnpm build:app` on Linux would fail at
   the bundling step (expected; installers are built on Windows).
3. Settings writes are last-write-wins with no history; fine for Phase 0.

## Architectural decisions this session

See the decision log in `docs/architecture.md` (Tauri 2, sam-core split,
bundled SQLite, append-only migrations, JSON settings, plain-CSS tokens,
typed `CommandError` IPC contract, launch-counter persistence probe,
`sam-junior/` nesting inside the ImageRights repo).

## Next recommended action (Phase 1 start)

1. Verify Phase 0 on Sam's Windows machine (item 1 above).
2. Design the orb component with its 7 states (Offline/Ready/Listening/
   Thinking/Working/Speaking/Error) as a pure presentational component.
3. Add global shortcut (Alt+Space via `tauri-plugin-global-shortcut`;
   document fallback if it conflicts) + quick panel window with focused
   input and Escape-to-close.
4. Command Center shell: Home, Conversations, Memory, Projects, Tasks,
   Activity, Permissions, Settings — real navigation, no fake data pages
   (empty states must say honestly that the feature arrives in a later
   phase).
5. Extend settings schema only as real UI needs appear.

---

## Session log

### 2026-07-05 — Phase 0 (this session)
Environment + repo audit → workspace scaffold → sam-core (db, migrations,
settings + 7 tests) → Tauri shell (logging, state, 4 commands) → React
status UI (bilingual, honest error states) → icons → docs → verification
(tests, builds, two headless launches proving persistence). Committed and
pushed to `claude/sam-junior-desktop-app-8cwgnr`.
