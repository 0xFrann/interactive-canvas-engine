# ADR 002: Persist the document as a flat JSON node list

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Document model

## Context

In memory the document is a tree of `Map`-backed `children` plus a `nodeReferences` index (same object refs). `JSON.stringify` does not serialize `Map`s usefully, and dumping nested `children` would embed the tree shape twice relative to an id index. We need a save/load path that round-trips structure and `activeNode` without shipping runtime Maps.

## Options

1. **Nested JSON tree** — serialize `children` recursively  
   - Pros: mirrors in-memory containment  
   - Cons: larger/ambiguous vs index; harder to patch by id; still need to rebuild `nodeReferences` on load

2. **Flat `nodes[]` with `parentId`** — one row per node; rebuild tree + index on load  
   - Pros: plain JSON; order-independent with a two-pass hydrate; no Maps on disk  
   - Cons: file is not the tree; load must link parents carefully

3. **Serialize `nodeReferences` only** — flat map keyed by id  
   - Pros: lookup-shaped  
   - Cons: still need parent links; easy to forget rebuilding `children` Maps

## Decision

Persist **`metadata` + flat `nodes[{ id, parentId, x, y }]` + `activeNodeId`**. No nested children and no `nodeReferences` in the file. Load is **two passes**: create every node (empty `children`, register in index) → link into `parent.children` → restore `activeNode`. Save walks `nodeReferences` and emits rows.

## Why

Learner lock: disk is a projection, not a dump of runtime structure. Child-before-parent file order must not break load, so hydration cannot be “`addNode` in array order” (and `addNode`’s active-parent rule is the wrong constraint for restore).

## Consequences

- Save/load bypass interactive insert rules.
- Missing/duplicate ids and missing parents fail loudly on load.
- Follow-up: version field / schema evolution when node props grow.
