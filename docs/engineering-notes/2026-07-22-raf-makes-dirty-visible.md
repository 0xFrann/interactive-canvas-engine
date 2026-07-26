# 2026-07-22 — Dirty alone didn’t save paints until RAF

Before instrumentation: every `pointermove` called `paint()` immediately. Dirty deferred sync into `ensureWorld`, but paint and sync still ran ~1:1 with moves — so “saved repaints” was ~0. There was **no** 60fps target defined.

Coalescing first lived in the demo; then moved into [`@canvas-engine/runtime`](../runtime.md) ([ADR 015](../decisions/015-runtime-frame-loop.md)) so the engine owns the clock. HUD still shows moves / paints / worldSyncs per drag.

**Interview one-liner:** Dirty skips redundant *derived* work between paints; the runtime frame loop skips redundant *paints* between frames — you need both mismatches to see both savings.
