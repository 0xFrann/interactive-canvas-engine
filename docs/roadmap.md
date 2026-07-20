# Roadmap

Living plan for the Interactive Canvas Engine. Status: `todo` | `teaching` | `building` | `done` | `doc-only`.

North star: [goal.md](./goal.md)

| # | Topic | Status | Code | Docs | ADR |
|---|-------|--------|------|------|-----|
| 1 | Document model | done (TBDs listed) | [`packages/document`](../packages/document) | [document-model.md](./document-model.md) | [001](./decisions/001-document-as-tree.md) |
| 2 | Scene graph | todo | — | — | — |
| 3 | Renderer | todo | — | — | — |
| 4 | Camera | todo | — | — | — |
| 5 | Hit testing | todo | — | — | — |
| 6 | QuadTree | todo | stretch | — | — |
| 7 | Collaboration | todo | skip | planned | — |

## Current focus

**Paused after Document model Capture.** Next session: TBD items below, or Teach **scene graph**.

## Document model — TBD (do not lose)

- [ ] Delete subtree + purge descendants from `nodeReferences`
- [ ] JSON save/load (serialize `Map`s)
- [ ] Id generation; update / reparent
- [ ] Revisit `activeNode` insert rules if they get in the way

## Next up

1. Pick up a TBD **or** start scene graph (local → world)
2. Keep Capture habit after each slice

## Session log

| Date | What happened |
|------|----------------|
| 2026-07-20 | Goal condensed; coach agent + roadmap created |
| 2026-07-20 | Document model: ADR 001 (tree); discovery build; hybrid index; same-ref fix |
| 2026-07-20 | Capture: document-model.md + session-close note; TBDs parked; slice marked done |
