# 2026-07-22 — moves ≈ paints was vsync, not a broken loop

Dragging showed moves ≈ paints. Runtime coalescing was fine; **browsers often dispatch ~one `pointermove` per refresh**, so there was nothing to merge.

Fix toward a real engine: sample input at event rate (including `getCoalescedEvents`), **commit document mutations once in `beforePaint`**, paint once per tick. HUD also shows `frameReqs→ticks`. **Burst 40 updates** forces many `requestFrame`s in one turn so coalescing is obvious even when the OS aligns pointer to vsync.

**Interview one-liner:** The frame loop doesn’t create free savings if input is already frame-rate; you sample hot input, apply once per tick, and coalesce paint — prove it with a sync burst when the pointer is quiet.
