# SAM JUNIOR — Permission Model

> Status: **design contract**. The permission engine is implemented in the
> Windows Action System phase; this document is written first so every tool
> is built against it from day one. Nothing below is implemented yet unless
> `PROJECT_STATUS.md` says so.

## Risk levels

Every tool in the registry declares exactly one risk level.

### GREEN — low risk (read-only or trivially reversible)

Examples: search configured files, read project memory, open an
application, list running applications, read clipboard.

May run automatically **if** the user has enabled auto-run for GREEN
actions in Settings. Still logged, always.

### YELLOW — medium risk (reversible modifications)

Examples: rename/move files, create calendar events, prepare drafts,
modify documents.

Requires per-action confirmation, unless the user has granted a **scoped
standing permission** (e.g. "always allow moving files inside
`Career/CV`"). Standing permissions are visible and revocable in the
Permissions page.

### RED — high risk (destructive, outward-facing, or irreversible)

Examples: delete files, send emails, submit applications, publish content,
payments, install software, elevated commands, system-settings changes.

**Always** requires explicit confirmation. No standing permissions exist
for RED. No exceptions.

## Confirmation UI contract

Every confirmation must state, concretely:

- **Action** — what will be done
- **Target** — exact file/app/recipient
- **Reason** — why SAM proposes it
- **Expected effect** — what changes
- **Reversibility** — how (or whether) it can be undone
- **Risk level** — visible color + label

Vague prompts ("Continue?") are forbidden. Model wording:

> SAM JUNIOR is ready to move `CV_2026.docx` from Downloads to Career/CV.
> The original location will change. Allow this action?

## Tool registry contract

Each tool ships with: unique name · description · typed input schema ·
risk level · permission requirement · execution handler · result
verification · audit-log entry. A tool that cannot verify its own result
must report "unverified", never "done".

Initial tool set (Windows Action System phase): `open_application`,
`close_application`, `open_folder`, `open_file`, `search_files`,
`reveal_in_explorer`, `get_clipboard_text`, `set_clipboard_text`,
`get_running_applications`.

## Decision flow

```
tool request → validate typed input → resolve risk level
  → GREEN + auto-run enabled?          → execute
  → YELLOW + matching standing grant?  → execute
  → otherwise                          → explicit user confirmation
→ execute → verify result → activity log (always, including denials/failures)
```

Denied or failed actions are logged and reported to the user honestly —
never hidden.
