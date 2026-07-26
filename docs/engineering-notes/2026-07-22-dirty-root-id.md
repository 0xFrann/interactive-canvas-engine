# 2026-07-22 — Dirty is one root id, not a renderer array

Implemented deferral after the input-vs-paint story clicked. First idea was an array on the renderer of nodes to update; better: **document** owns a single `dirtyRootId` because only one ancestor moves per gesture, and hit-test/reparent need the same flush. A `Set` can wait until multiple independent writes share one paint.

**Interview one-liner:** We mark one dirty root on local move and `ensureWorld` before paint — sync at frame rate, not pointer rate; the flag isn’t “fake data,” it’s skipped work on purpose.
