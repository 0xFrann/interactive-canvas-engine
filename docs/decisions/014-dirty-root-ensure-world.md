# ADR 014: Dirty root + ensureWorld (defer world sync to read/paint)

- **Status:** Accepted
- **Date:** 2026-07-22
- **Topic:** Document model / performance
- **Supersedes:** [ADR 013](./013-eager-world-sync-dirty-deferred.md)

## Context

World is cached on nodes (`worldX`/`worldY`). Eager `syncWorldSubtree` on every local move pays subtree cost at **input rate**. After understanding input vs paint ([note](../engineering-notes/2026-07-22-dirty-input-vs-paint-rate.md)), we chose to implement dirty deferral.

This app moves **one** ancestor at a time (single-node drag), so a dirty **set** is unnecessary.

## Options

1. **Eager sync on every `updateNode`** — simple; wastes work when several moves precede one paint (ADR 013).
2. **`dirtyRootId` + `ensureWorld()`** — mark one pending root on write; sync that subtree on flush.
3. **Dirty `Set` of roots** — needed if many independent writes land before one paint (multi-select, batch remote ops). Overkill for current drag.

## Decision

**Option 2.** On local `x`/`y` change: set `dirtyRootId` (no sync). Call `ensureWorld()` before paint, hit-test, `getWorldPosition`, `addNode`, and `reparentNode`. If a *different* node is marked dirty while one is pending, flush the previous root first so work is not lost.

## Why

Learner: paint rate is what the user sees; three pointermoves then one paint should sync once. Single dirty id matches “only one ancestor moves.” Document owns invalidation — not the renderer — so hit-test and reparent stay correct.

## Consequences

- Readers that touch `node.worldX` directly without `ensureWorld` can see stale values; package APIs flush for you.
- Multi-root dirty between paints is handled by flush-on-switch, not a `Set`.
- Revisit a `Set` if batch updates become common.
