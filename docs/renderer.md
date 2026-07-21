# Renderer

## What it is

Canvas 2D paint for document nodes. Package: `@canvas-engine/renderer`. Reads world via `@canvas-engine/scene-graph`; does not own the board model.

## Why it exists

Keep draw code out of the document. Same boundary as [Mural’s paint engine story](https://dev.to/mural/performant-paintings-building-a-canvas-render-engine-4506): structure vs presentation.

## How it works here

- **`renderDocument(doc, ctx, options?)`** — clear (optional background), then for each node: `getWorldPosition` → `fillRect` / `strokeRect` using **`node.width` / `node.height`**. Active node (`doc.activeNodeId`, when not root) gets a thicker outline drawn last.
- **Size:** owned by the document ([ADR 008](./decisions/008-node-width-height.md)); renderer re-exports create defaults only for convenience.
- **Demo:** `apps/demo` wires document + renderer + click select / add / nudge.

## Alternatives considered

- Size on Node first — deferred one commit so the board is visible sooner.
- Paint inside the demo only — rejected; want an isolated render package.

## What I would do differently

- Next: nothing urgent on size; camera is the bigger open.

## Open questions

- [ ] Draw order / z-index beyond map iteration
- [ ] Camera transform (roadmap #4)
- [ ] Dirty/partial redraw when boards grow

## Trade-offs

| Choice | Gain | Cost |
|--------|------|------|
| Isolated package | Clear engine boundary | Extra workspace wiring |
| Hardcoded size | Demo ships now | Hit-test/paint disagree with real size later until #3a |
| Full clear each paint | Simple | Fine until N is large |

## How Mural probably solves this

Dedicated render path, viewport culling, layered draw; size and transforms as first-class scene data.

## References

- [Scene graph](./scene-graph.md)
- [Roadmap](./roadmap.md)
