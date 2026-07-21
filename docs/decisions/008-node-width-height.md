# ADR 008: Node width/height on the document

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Document model / Renderer
- **Supersedes in part:** [ADR 007](./007-isolated-renderer-hardcoded-size.md) (hardcoded paint size)

## Context

Paint and hit-testing need a real box. ADR 007 hardcoded 120×80 in the renderer so the demo could ship.

## Decision

- Persist **`width` / `height` on `Node`** (and in flat JSON).
- `addNode` accepts optional size; defaults **120×80** (`DEFAULT_NODE_WIDTH` / `DEFAULT_NODE_HEIGHT` on the document package).
- `updateNode` may patch size; world sync only runs when local `x`/`y` change.
- Renderer and demo read `node.width` / `node.height`.

## Why

One source of truth for the box used by paint, demo hit-test, and future real hit-testing. Defaults keep existing call sites short.

## Consequences

- Saved boards include size.
- Renderer no longer owns size constants (re-exports document defaults only for convenience).
