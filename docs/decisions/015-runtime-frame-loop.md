# ADR 015: Runtime frame loop package

- **Status:** Accepted
- **Date:** 2026-07-22
- **Topic:** Runtime / scheduling

## Context

Dirty world sync ([ADR 014](./014-dirty-root-ensure-world.md)) only pays off when work is deferred to paint rate. Coalescing lived in the demo via local `requestAnimationFrame`, which meant the engine did not own its clock.

## Options

1. **Keep RAF in the demo** — simplest; engine incomplete.
2. **RAF inside `@canvas-engine/renderer`** — paint coalescing, but clock tied to canvas.
3. **`@canvas-engine/runtime` frame loop** — `requestFrame` + ordered listeners; inject scheduler in tests.

## Decision

**Option 3.** Create `@canvas-engine/runtime` with `createFrameLoop`, `requestFrame`, `onBeforePaint` / `onPaint`, `cancelPending` / `stop`. Demo mutates then `requestFrame()`; registers `ensureWorld` then `renderDocument`. Hit-test keeps immediate `ensureWorld`.

## Why

A proper engine needs one place to schedule and dispatch per-frame work. RAF follows the display refresh (not a hardcoded 60). Keeping the clock separate leaves renderer pure and allows headless/fake clocks in tests.

## Consequences

- Apps must wire the loop (or a future higher-level `Engine` facade).
- Dirty + runtime together make input-vs-paint savings real and measurable in the HUD.
