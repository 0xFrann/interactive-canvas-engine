# 2026-07-21 — World cache/dirty: park until render pain is real

For scene graph v1 we compute world on the fly (sum locals up the parent chain). Cache + dirty flags would help when we *ask* for world so often that walks hurt — e.g. a 60fps paint loop over many nodes while dragging a frame, deep nesting, or rotation/scale matrices — not merely because “parent moves, children follow on screen” (that case is exactly when a cache would need descendants marked dirty).

This board is create-heavy with occasional drag and no renderer yet, so on-the-fly is enough. **Revisit when building the renderer (and continuous interaction):** if profiling shows repeated parent-chain walks per frame, then add dirty invalidation on `updateNode` / `reparent` and cache world (or matrices) on read.

**Interview one-liner:** Local coords stay cheap to mutate; world is derived. Cache only when read frequency makes the walk hot — and dirty the whole subtree when an ancestor moves.
