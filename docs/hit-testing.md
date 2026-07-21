# Hit testing

## What it is

Pick which document node (if any) lies under a **world-space** point. Package: `@canvas-engine/hit-testing`.

## Why it exists

Selection, drag, and tools need “what did the user point at?” Camera converts screen → world; this package answers the spatial query. Keeping it out of the demo avoids duplicating box math.

## How it works here

- **`hitTest(doc, { x, y })`** — scan `nodeReferences`; axis-aligned box from `worldX`/`worldY` + `width`/`height`.
- **Top-most wins** — last matching node in map iteration order (good enough until explicit z-order).
- **Demo:** `screenToWorld` then `hitTest` for click / pan-vs-select.

## Alternatives considered

- Keep inline in the demo — rejected once camera existed; drag will need the same API.
- QuadTree first — stretch; linear scan is fine at current N.

## What I would do differently

- Explicit paint/hit z-order when overlaps matter for product UX.

## Open questions

- [ ] Node drag (next baby step) — done in demo; see [ADR 011](./decisions/011-node-drag-demo.md)
- [ ] Reparent when dropping outside current parent
- [ ] Spatial index when N grows (roadmap #6)

## Trade-offs

| Choice | Gain | Cost |
|--------|------|------|
| World-space API | Composes with camera | Callers must convert screen first |
| Linear scan | Simple, correct | O(n) per pick |
| Map iteration order | Matches current paint heuristic | Not a real z-index |

## How Mural probably solves this

Layered hit targets, possibly spatial indexes / GPU picking at scale; same screen→world→query pipeline.

## References

- [Camera](./camera.md)
- [ADR 010](./decisions/010-hit-testing-package.md)
