# Roadmap

Living plan for the Interactive Canvas Engine. Status: `todo` | `teaching` | `building` | `done` | `doc-only`.

North star: [goal.md](./goal.md)

| # | Topic | Status | Code | Docs | ADR |
|---|-------|--------|------|------|-----|
| 1 | Document model | done | [`packages/document`](../packages/document) | [document-model.md](./document-model.md) | [001](./decisions/001-document-as-tree.md)–[004](./decisions/004-reparent-unlink-relink.md) |
| 2 | Scene graph | done | [`packages/scene-graph`](../packages/scene-graph) | [scene-graph.md](./scene-graph.md) | [005](./decisions/005-scene-graph-on-the-fly-separate-package.md)→[006](./decisions/006-world-on-document-scene-facade.md) |
| 3 | Renderer | done | [`packages/renderer`](../packages/renderer) · [`apps/demo`](../apps/demo) | [renderer.md](./renderer.md) | [007](./decisions/007-isolated-renderer-hardcoded-size.md)–[008](./decisions/008-node-width-height.md) |
| 4 | Camera | done | [`packages/camera`](../packages/camera) | [camera.md](./camera.md) | [009](./decisions/009-camera-package.md) |
| 5 | Hit testing | done | [`packages/hit-testing`](../packages/hit-testing) | [hit-testing.md](./hit-testing.md) | [010](./decisions/010-hit-testing-package.md) |
| 6 | QuadTree | todo | stretch | — | — |
| 7 | Collaboration | todo | skip | planned | — |

## Current focus

**Next: evaluate cache/dirty under drag** Drop reparent done (ADR 012). Only add dirty if write path hurts.

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

## Renderer — park / plan

- [x] **#3b** `packages/renderer` + `apps/demo` ([ADR 007](./decisions/007-isolated-renderer-hardcoded-size.md))
- [x] **#3a** Node `width` / `height` ([ADR 008](./decisions/008-node-width-height.md))
- [x] Camera / viewport (roadmap #4)
- [x] Hit testing package (roadmap #5)
- [x] Node drag in demo (world delta → local `updateNode`; [ADR 011](./decisions/011-node-drag-demo.md))
- [x] Drop reparent: cursor adopt + leave-parent-to-root ([ADR 012](./decisions/012-drop-reparent.md))
- [ ] Revisit cache/dirty only after drag exists and hurts

## Next up

1. **Evaluate cache/dirty** under real nested drag (only if it hurts)
2. QuadTree stretch / collaboration docs

## Session log

| Date | What happened |
|------|----------------|
| 2026-07-21 | Drop reparent (uncommitted): cursor adopt; leave parent when cursor exits box |
| 2026-07-21 | Demo node drag via world delta → local update (ADR 011) |
| 2026-07-21 | Hit-testing package; demo uses world-space pick (ADR 010) |
| 2026-07-21 | Plan: hit-test → node drag → evaluate cache/dirty (baby steps) |
| 2026-07-21 | Camera package + demo pan/zoom (ADR 009) |
| 2026-07-21 | Node width/height persisted; renderer uses real size (ADR 008) |
| 2026-07-21 | Renderer + demo app; hardcoded size; ADR 007 |
| 2026-07-21 | Renderer: lock package + size-before-paint; start #3a Teach |
| 2026-07-21 | Commit ADR 006; start renderer Teach |
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
