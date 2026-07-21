# Roadmap

Living plan for the Interactive Canvas Engine. Status: `todo` | `teaching` | `building` | `done` | `doc-only`.

North star: [goal.md](./goal.md)

| # | Topic | Status | Code | Docs | ADR |
|---|-------|--------|------|------|-----|
| 1 | Document model | done | [`packages/document`](../packages/document) | [document-model.md](./document-model.md) | [001](./decisions/001-document-as-tree.md)–[004](./decisions/004-reparent-unlink-relink.md) |
| 2 | Scene graph | building | [`packages/scene-graph`](../packages/scene-graph) | [scene-graph.md](./scene-graph.md) | [005](./decisions/005-scene-graph-on-the-fly-separate-package.md)→[006](./decisions/006-world-on-document-scene-facade.md) |
| 3 | Renderer | todo | — | — | — |
| 4 | Camera | todo | — | — | — |
| 5 | Hit testing | todo | — | — | — |
| 6 | QuadTree | todo | stretch | — | — |
| 7 | Collaboration | todo | skip | planned | — |

## Current focus

**#2 Scene graph — building** world on document + thin facade (ADR 006). Open: bounds; camera/hit-test grow scene-graph.

## Document model — TBD (do not lose)

- [x] Delete subtree + purge descendants from `nodeReferences`
- [x] JSON save/load (flat file → rebuild tree + `nodeReferences`)
- [x] `updateNode` (local `x`/`y` only — not recursive)
- [x] Id generation (`addNode({ x, y })` → UUID; ADR 003)
- [x] Reparent (`reparentNode`; cycle-checked unlink/relink; ADR 004)
- [x] Insert UX — keep select-then-add under active; cursor is `activeNodeId` (+ getter)
- [x] `activeNodeId` cursor refactor (getter resolves via index)

## Scene graph — park / revisit

- [x] World on document + reparent preserve ([ADR 006](./decisions/006-world-on-document-scene-facade.md)); scene-graph kept as read facade
- [ ] Grow scene-graph for camera / hit-test (not just `getWorldPosition`)
- [ ] If write-path subtree sync hurts under continuous drag, consider dirty flags ([note](./engineering-notes/2026-07-21-world-cache-revisit-at-render.md))

## Next up

1. Start renderer Teach, or bounds when nodes gain size
2. Keep Capture habit

## Session log

| Date | What happened |
|------|----------------|
| 2026-07-21 | ADR 006: worldX/Y on document; reparent preserves world; scene-graph facade |
| 2026-07-21 | Scene graph: `getWorldPosition` on-the-fly; docs + note; tests green |
| 2026-07-21 | Scene graph: locked on-the-fly + separate package (ADR 005); cache/dirty parked for renderer |
| 2026-07-21 | Scene graph: start Teach (local→world); first slice scoped |
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
