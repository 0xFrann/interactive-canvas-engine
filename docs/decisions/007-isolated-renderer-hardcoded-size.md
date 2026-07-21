# ADR 007: Isolated renderer package; temporary hardcoded node size

- **Status:** Superseded in part by [ADR 008](./008-node-width-height.md) (size on Node); package + demo decisions still stand
- **Date:** 2026-07-21
- **Topic:** Renderer

## Context

Need visible paint and a demo app without blocking on document `width`/`height`.

## Options

1. **Size on Node first, then paint** — honest boxes before pixels.
2. **Hardcode size in renderer now; size on Node next commit** — show the board sooner.
3. **Paint only in the demo app** — faster spike; weak engine boundary.

## Decision

- Add `@canvas-engine/renderer` with `renderDocument`.
- Use temporary `DEFAULT_NODE_WIDTH` / `DEFAULT_NODE_HEIGHT`.
- Add `apps/demo` (Vite) so the project is runnable, not SDK-only.

## Why

Learner priority: see document → world → pixels. Isolated package still matches “render engine” interview story; size lands immediately after.

## Consequences

- Demo hit-test uses the same hardcoded size as paint.
- Follow-up must persist real size on nodes and update renderer + demo.
