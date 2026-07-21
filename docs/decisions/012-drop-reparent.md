# ADR 012: Drop reparent — cursor adopt + leave-parent-to-root

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Hit testing / interaction

## Context

After node drag, parenting should update when the user clearly intends a new container.

## Options

1. **Cursor-only** — always parent = hit under cursor (or root if miss).
2. **Geometry-only** — parent = deepest box containing the node center.
3. **Hybrid** — (a) cursor over another node ≠ current parent → that parent; (b) else if cursor left current parent box → root.

## Decision

Hybrid via `resolveDropParent` in `@canvas-engine/hit-testing`. Hit-test for drops ignores the dragged subtree. Demo calls it on node-drag pointerup, then `reparentNode` (world-preserving).

1. Cursor over another node ≠ current parent → that parent.
2. Else if **cursor** is outside the current parent box → `root`.
3. Else → no change.

## Why

Matches the two product moments: “drop into that frame” (cursor over it) and “I dragged out” (**cursor** left the parent — not the node’s center). Avoids detaching while the pointer is still inside the parent.

## Consequences

- Top-most node under cursor wins (same as pick); may land on a sticky instead of a frame if they overlap — acceptable for v1.
- Cache/dirty still deferred.
