# ADR 006: World stored on document; scene-graph stays a read facade

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Scene graph / document model
- **Supersedes:** [ADR 005](./005-scene-graph-on-the-fly-separate-package.md)

## Context

We needed world position for nested boards and **reparent without teleporting**. Naive “document imports scene-graph” cycles the packages. Options: orchestrator/inject, fold math into document only, or **denormalize world onto nodes**.

## Options

1. **Keep on-the-fly in scene-graph** (ADR 005) — no cycle; reparent-preserve needs an orchestrator or inject.
2. **World fields on `Node`, maintained by document** — O(1) read; reparent can rewrite locals from stored world; write path must sync subtree on local moves.
3. **Delete scene-graph package** — document is the only spatial API until renderer.

## Decision

- Store **`worldX` / `worldY` on `Node`**. Document maintains them on `addNode`, `updateNode` (subtree sync), `reparentNode` (preserve world → rewrite local), and `load` (recompute from locals). **Not persisted** in JSON (locals + tree remain canonical on disk).
- Keep **`@canvas-engine/scene-graph`** as a thin **`getWorldPosition`** facade over those fields — scaffolding for camera / hit-test later, without owning truth.
- **`reparentNode` always preserves world** (rewrites local under the new parent).

## Why

Avoid package cycle while shipping reparent-preserve now. Eager world on write matches “create + occasional drag” better than dirty flags. Scene-graph package stays so renderer work has a clear import without bloating every call site with `node.worldX` forever.

## Consequences

- Local remains the persisted spatial truth; world is runtime denormalized state.
- Moving a frame updates descendant worlds in the document write path.
- ADR 005’s “derive only in scene-graph” no longer holds; amend mental model: document = tree + locals + maintained world; scene-graph = render-facing reads (grows later).
