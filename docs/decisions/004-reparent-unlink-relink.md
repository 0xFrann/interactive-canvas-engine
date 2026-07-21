# ADR 004: Reparent by unlink/relink (cycle-checked)

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Document model

## Context

Boards need to move a sticky into a frame (or out to the root) without rewriting the whole tree. The subtree under the moved node must stay attached. Local `x`/`y` stay as stored; world position may change until scene graph converts.

## Options

1. **Deep clone into new parent** — breaks same-ref index; expensive  
2. **Unlink + relink same object** — O(1) map ops; index unchanged  
3. **Flat list only + rewrite parentId** — we already have a tree of Maps to keep consistent  

## Decision

`reparentNode(newParentId)` on the **active** node: delete from old parent’s `children`, set `parentId`, add to new parent’s `children`. Reject root. Reject moves that would create a cycle (new parent is the node or a descendant). Same-parent is a no-op. Do not rewrite descendant coords.

## Why

Structural move is what nesting means; the children Maps already own the subtree. Cycle checks keep the tree a tree.

## Consequences

- `nodeReferences` size unchanged; identity preserved.  
- Coordinate conversion on reparent (keep world position) deferred to scene graph / a later API.  
