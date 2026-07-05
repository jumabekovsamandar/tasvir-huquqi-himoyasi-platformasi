# Repository guide

This repository contains **two independent projects**:

| Path | Project | Stack |
|---|---|---|
| `/frontend`, `/backend`, `/backend-v2`, `/docs` | **ImageRights.uz** — LegalTech platform for image-rights protection (web) | Next.js 14, NestJS, Prisma, PostgreSQL |
| `/sam-junior` | **SAM JUNIOR** — private personal AI assistant for Windows (desktop) | Tauri 2, Rust, React 19, TypeScript, SQLite |

Rules:

- Work on one project must not modify the other.
- SAM JUNIOR sessions: read `sam-junior/CLAUDE.md` first; the authoritative
  progress record is `sam-junior/docs/PROJECT_STATUS.md`.
- ImageRights docs live in `/docs` (ARCHITECTURE, API, DATABASE, SECURITY,
  ROADMAP).
