# Scene graph

## What it is

Render-facing spatial facade over the document. Today: **`getWorldPosition(doc, nodeId)`** returns the node’s maintained board position. Package: `@canvas-engine/scene-graph`. Will grow for camera / hit-test; it does not own stickies.

## Why it exists

Call sites (renderer later) should depend on a spatial API, not dig through document internals forever. After [ADR 006](./decisions/006-world-on-document-scene-facade.md), **truth for world lives on the node** (`worldX`/`worldY`); this package is the stable import surface.

## How it works here

- Document sets `worldX`/`worldY` on add / local update (subtree) / load; reparent preserves world by rewriting local.
- `getWorldPosition` reads those fields (O(1)); no parent-chain walk on read.
- Locals still mean “relative to parent”; moving a frame does not rewrite child locals — document syncs descendant **world** instead.

```mermaid
flowchart LR
  Doc[Document writes world on mutate]
  SG[scene-graph getWorldPosition]
  Doc -->|worldX worldY| SG
```

## Alternatives considered

- On-the-fly walk in this package only — [ADR 005](./decisions/005-scene-graph-on-the-fly-separate-package.md), superseded (cycle vs reparent-preserve).
- Delete this package — deferred; keep scaffolding for #3+.

## What I would do differently

- Nothing yet; watch that the facade stays thin until camera needs real logic here.

## Open questions

- [ ] World → screen via camera (this package)
- [ ] Bounds / size in world space when nodes gain width/height

## Trade-offs

| Choice | Gain | Cost |
|--------|------|------|
| World on document | Reparent-preserve + O(1) read; no package cycle | Write path must sync subtree |
| Thin scene-graph | Stable import for renderer | Almost a pass-through today |
| World not in JSON | File stays local-canonical | Must recompute world on load |

## How Mural probably solves this

Runtime scene/transform state often denormalized for paint; persistence/sync keeps a smaller canonical form. Separate modules for camera and hit-test even when data lives on nodes.

## References

- [ADR 006](./decisions/006-world-on-document-scene-facade.md)
- [Document model](./document-model.md)
- [Engineering note — world on document](./engineering-notes/2026-07-21-world-on-document.md)
