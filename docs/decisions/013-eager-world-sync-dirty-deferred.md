# ADR 013: Stay with eager world sync; dirty deferred

- **Status:** Superseded by [ADR 014](./014-dirty-root-ensure-world.md)
- **Date:** 2026-07-22
- **Topic:** Document model / performance

## Context

After real node drag, we revisited cache/dirty. World is already cached on the node (`worldX`/`worldY`); each local move runs `syncWorldSubtree`.

## Options

1. **Implement dirty/lazy world refresh now** — practice the pattern.
2. **Stay eager** — sync subtree on write; revisit when input rate or culling makes full sync wasteful.
3. **Drag bitmap / commit-on-pointerup** — render optimization; separate from dirty.

## Decision

**Stay eager.** Document the problem dirty solves ([note](../engineering-notes/2026-07-22-dirty-input-vs-paint-rate.md)); do not ship dirty flags yet.

## Why

Learner insight: patterns only matter when there is a problem. Our demo roughly syncs and paints per move; dirty would not clearly win. The useful story is **input events vs paint frames** (and later culling), not “always use dirty.”

## Consequences

- `syncWorldSubtree` remains the write-path source of fresh world.
- Follow-ups that could justify dirty: `requestAnimationFrame` batching, viewport culling, large N under drag profiling.
