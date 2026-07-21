# 2026-07-21 — Demo first: hardcoded paint size, real size next

Shipped `@canvas-engine/renderer` and `apps/demo` so the board is visible. Node size stays hardcoded in the renderer for one commit; document `width`/`height` is the immediate follow-up. Package stays isolated from the document so paint can evolve without CRUD changes.

**Interview one-liner:** Document owns truth; renderer only paints — temporary constants are fine if you call out the next slice.
