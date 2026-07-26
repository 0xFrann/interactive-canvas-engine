# Scene graph

## What it is

Render-facing spatial facade over the document. Today: **`getWorldPosition(doc, nodeId)`** returns the node’s maintained board position. Package: `@canvas-engine/scene-graph`. Will grow for camera / hit-test; it does not own stickies.

## Why it exists

Call sites (renderer later) should depend on a spatial API, not dig through document internals forever. After [ADR 006](./decisions/006-world-on-document-scene-facade.md), **truth for world lives on the node** (`worldX`/`worldY`); this package is the stable import surface.

## How it works here

- Document caches `worldX`/`worldY`; local `x`/`y` updates set `dirtyRootId` and defer subtree sync until `ensureWorld()` ([ADR 014](./decisions/014-dirty-root-ensure-world.md)).
- `getWorldPosition` calls `ensureWorld` then reads those fields (O(1) after flush).
- Locals still mean “relative to parent”; moving a frame does not rewrite child locals — flush syncs descendant **world**.

```mermaid
flowchart LR
  Doc[Document dirtyRootId + ensureWorld]
  SG[scene-graph getWorldPosition]
  Doc -->|worldX worldY| SG
```

## Alternatives considered

- On-the-fly walk in this package only — [ADR 005](./decisions/005-scene-graph-on-the-fly-separate-package.md), superseded (cycle vs reparent-preserve).
- Delete this package — deferred; keep scaffolding for #3+.
- Eager sync forever — [ADR 013](./decisions/013-eager-world-sync-dirty-deferred.md), superseded by 014.

## What I would do differently

- Nothing yet; watch that the facade stays thin until camera needs real logic here.

## Open questions

- [x] Size on nodes + camera world→screen (other packages)
- [x] Dirty / lazy world refresh ([ADR 014](./decisions/014-dirty-root-ensure-world.md))
- [ ] Dirty `Set` if multi-root writes share one paint
## Trade-offs

| Choice | Gain | Cost |
|--------|------|------|
| World on document | Reparent-preserve + O(1) read; no package cycle | Write path must sync subtree |
| Eager sync on move | Simple; always-fresh world for paint/hit | Wasteful if many moves per paint or huge off-screen subtrees |
| Thin scene-graph | Stable import for renderer | Almost a pass-through today |
| World not in JSON | File stays local-canonical | Must recompute world on load |

## How Mural probably solves this

Runtime scene/transform state often denormalized for paint; persistence/sync keeps a smaller canonical form. Separate modules for camera and hit-test even when data lives on nodes.

## References

- [ADR 006](./decisions/006-world-on-document-scene-facade.md)
- [ADR 013](./decisions/013-eager-world-sync-dirty-deferred.md)
- [Document model](./document-model.md)
- [Engineering note — dirty problem-first](./engineering-notes/2026-07-22-dirty-input-vs-paint-rate.md)
- [Engineering note — world on document](./engineering-notes/2026-07-21-world-on-document.md)
