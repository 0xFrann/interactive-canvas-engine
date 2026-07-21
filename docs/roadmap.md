# Roadmap

Living plan for the Interactive Canvas Engine. Status: `todo` | `teaching` | `building` | `done` | `doc-only`.

North star: [goal.md](./goal.md)

| # | Topic | Status | Code | Docs | ADR |
|---|-------|--------|------|------|-----|
| 1 | Document model | done | [`packages/document`](../packages/document) | [document-model.md](./document-model.md) | [001](./decisions/001-document-as-tree.md)–[004](./decisions/004-reparent-unlink-relink.md) |
| 2 | Scene graph | todo | — | — | — |
| 3 | Renderer | todo | — | — | — |
| 4 | Camera | todo | — | — | — |
| 5 | Hit testing | todo | — | — | — |
| 6 | QuadTree | todo | stretch | — | — |
| 7 | Collaboration | todo | skip | planned | — |

## Current focus

**Next: Teach scene graph** (local → world). Document model TBDs closed.

## Document model — TBD (do not lose)

- [x] Delete subtree + purge descendants from `nodeReferences`
- [x] JSON save/load (flat file → rebuild tree + `nodeReferences`)
- [x] `updateNode` (local `x`/`y` only — not recursive)
- [x] Id generation (`addNode({ x, y })` → UUID; ADR 003)
- [x] Reparent (`reparentNode`; cycle-checked unlink/relink; ADR 004)
- [x] Insert UX — keep select-then-add under active; cursor is `activeNodeId` (+ getter)
- [x] `activeNodeId` cursor refactor (getter resolves via index)

## Next up

1. Teach **scene graph** (local → world)
2. Keep Capture habit after each slice

## Session log

| Date | What happened |
|------|----------------|
| 2026-07-20 | Goal condensed; coach agent + roadmap created |
| 2026-07-20 | Document model: ADR 001 (tree); discovery build; hybrid index; same-ref fix |
| 2026-07-20 | Capture: document-model.md + session-close note; TBDs parked; slice marked done |
| 2026-07-21 | Subtree delete: recursive purge of `nodeReferences` + unlink; tests green |
| 2026-07-21 | JSON save/load: flat nodes + two-pass hydrate; ADR 002; tests green |
| 2026-07-21 | `updateNode`: local x/y patch; children unchanged; tests green |
| 2026-07-21 | Id generation: UUID on add; parent from activeNode; ADR 003 |
| 2026-07-21 | Reparent: unlink/relink + cycle check; ADR 004 |
| 2026-07-21 | Closed insert-UX TBD; document model ready for scene graph |
| 2026-07-21 | Cursor: store `activeNodeId`; `activeNode` getter via index |
