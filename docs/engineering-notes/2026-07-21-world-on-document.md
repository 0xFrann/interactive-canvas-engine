# 2026-07-21 — World on the node; scene-graph stays a facade

Kept `@canvas-engine/scene-graph` for later renderer/camera, but moved world into the document: `worldX`/`worldY` maintained on write so reparent can preserve board position without a document↔scene import cycle. Locals stay what we save; world is recomputed on load. `getWorldPosition` is now an O(1) read of those fields.

**Interview one-liner:** Denormalize world onto nodes when writes are rare and you need preserve-world reparent; keep a thin scene facade so render code doesn’t couple to document forever — and don’t create a package cycle by having document import scene.
