# 2026-07-22 — Frame loop belongs in a package

Moved RAF coalescing out of the demo into `@canvas-engine/runtime`. Input mutates + `requestFrame()`; the loop runs `beforePaint` (`ensureWorld`) then `paint` (`renderDocument`). Dirty is useful because the **engine** defines paint cadence, not because the app remembered to call RAF.

**Interview one-liner:** The runtime is the display-tied clock — coalesce requests to one tick per refresh; document dirty and renderer stay sync tools on that tick.
