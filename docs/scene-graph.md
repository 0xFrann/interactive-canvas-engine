# Scene graph

## What it is

Derived spatial layer over the document: given local `x`/`y` on nodes, answer **world** position on the board. Package: `@canvas-engine/scene-graph`. Does not own stickies — it reads `@canvas-engine/document`.

## Why it exists

Document mutates locals cheaply (move a frame without rewriting children). Paint and later hit-testing need absolute board coordinates. Separating “relative truth” from “where on the board” keeps CRUD simple and matches [ADR 005](./decisions/005-scene-graph-on-the-fly-separate-package.md).

## How it works here

- **`getWorldPosition(doc, nodeId)`** — walk `parentId` via `doc.nodeReferences`, sum local `x`/`y` until document root (`id === "root"`, not in the index). Root contributes `(0, 0)`.
- **On the fly** — no cached world, no dirty flags. After `updateNode` on a frame, children’s stored locals are unchanged; their world sum changes automatically.
- **Example:** frame local `(100, 50)`, sticky `(20, 10)` → sticky world `(120, 60)`. Frame → `(200, 50)` → sticky world `(220, 60)`.

```mermaid
flowchart LR
  R[root 0,0] -->|"+ frame local"| F[frame world]
  F -->|"+ sticky local"| S[sticky world]
```

## Alternatives considered

- Cache + dirty on ancestor moves — parked until renderer ask-rate hurts. See [note](./engineering-notes/2026-07-21-world-cache-revisit-at-render.md).
- World helpers inside `packages/document` — rejected; keep document = storage/CRUD.

## What I would do differently

- Nothing major for this thin slice; watch coupling if scene-graph starts reaching into private document internals.

## Open questions

- [ ] World → local (e.g. reparent while preserving on-screen position)
- [ ] Bounds / size in world space when nodes gain width/height
- [ ] Revisit cache/dirty at renderer (#3)

## Trade-offs

| Choice | Gain | Cost |
|--------|------|------|
| On-the-fly sum | Always correct; tiny code | Cost × depth × ask rate |
| Separate package | Clear boundary for render/camera | Extra workspace package |
| Read `nodeReferences` | O(1) per hop | Couples to document’s public index |

## How Mural probably solves this

Hierarchical transforms (often matrices once rotation/scale appear); derived world for paint/culling; caching or spatial indexes when boards are huge and interaction is continuous.

## References

- [ADR 005](./decisions/005-scene-graph-on-the-fly-separate-package.md)
- [Document model](./document-model.md) — local coords
- [Engineering note — cache revisit](./engineering-notes/2026-07-21-world-cache-revisit-at-render.md)
