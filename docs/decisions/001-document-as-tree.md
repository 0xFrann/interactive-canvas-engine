# ADR 001: Store the document as a tree of nodes

- **Status:** Accepted
- **Date:** 2026-07-20
- **Topic:** Document model

## Context

We need a source of truth for canvas objects (stickies, frames, shapes) that supports hierarchy (frames containing notes), stable identity, CRUD, and JSON load/save — before scene graph, renderer, or collaboration.

**Mural (presentation lesson):** Early Mural painted with the DOM; that failed at thousands of elements and led to a canvas render path with domain objects reduced to hierarchical ASTs. See [Performant Paintings: Building a Canvas Render Engine](https://dev.to/mural/performant-paintings-building-a-canvas-render-engine-4506). That history informs **presentation vs structure**: we are choosing a **data** shape for containment, not “use the DOM as the paint surface.”

**Learner background (Peacevoid OS):** Prior product work on [THE PEACEVOID OS](https://www.behance.net/gallery/194480187/THE-PEACEVOID-OS-Case-Study) — a desktop-OS-like web app (windows, apps, sidebar) built almost exclusively with the DOM; canvas only for specific surfaces. Distilled interactive logic: [desktop-os-react-next](https://github.com/0xFrann/desktop-os-react-next). That experience proves DOM-first UIs can carry rich hierarchy and interaction for an OS shell; it does **not** by itself justify the canvas **document** shape. It does make the Mural split vivid: Peacevoid-scale DOM UI ≠ mural-scale infinite board paint.

## Options

1. **Tree** — nested `children[]` under a root  
   - Pros: containment is explicit; subtree transforms (move/rotate/scale frame → children) are a walk of one branch; natural draw/hit order by hierarchy  
   - Cons: `getById` is O(n) without a secondary index; cross-parent moves need re-linking; nested JSON is clumsier for tiny patches

2. **Flat list / map** — `Record<id, Node>` with optional `parentId`  
   - Pros: O(1) lookup by id; patch-friendly for undo/sync  
   - Cons: containment is reconstructed; subtree ops reimplement “all descendants of X”

3. **Graph** — nodes + arbitrary edges  
   - Pros: connectors, many-to-many  
   - Cons: overkill as the *only* model for v1; harder to reason about ownership and serialize

## Decision

Use a **tree** (`Document` → root → nested nodes with `id`, `type`, props, `children`) as the canonical document.

## Why

For a board where frames contain objects, the document should make **group transformations** cheap and correct. A tree does that by making **parent–child containment** explicit: a frame’s transform applies to a clear subtree (one parent per node; descendants are defined by structure, not by scanning a flat list for matching `parentId`s).

We are **not** choosing a tree because it resembles the DOM, design-tool layer panels, or Peacevoid’s window tree. Those experiences helped *recognize* hierarchy; the decision is about **containment and inherited transform semantics** for board objects. DOM-as-renderer remains a separate concern — Mural moved off it for performance while still reasoning in hierarchical ASTs ([same article](https://dev.to/mural/performant-paintings-building-a-canvas-render-engine-4506)).

## Consequences

**Easier now**

- Subtree move/delete/transform without re-deriving children  
- Recursive walk for serialization and later scene-graph style traversal  
- Clear story: containment is first-class in the model

**Harder now**

- `findById` / selection updates are O(n) tree walks unless we add an index  
- Reparenting must splice nodes between `children[]` arrays carefully  
- Nested JSON is a poorer fit for minimal “patch node X” payloads

**Revisit triggers (keep the tree unless proven otherwise)**

| When | Direction | Notes |
|------|-----------|--------|
| Id-centric ops dominate (selection, hit-test resolve, frequent update-by-id) and walks show up in profiles | **Hybrid:** tree as source of truth + `Map<id, Node>` (or equivalent) for **O(1) id lookup** | Does not change canonical shape; index is derived/maintained on mutate |
| Undo / sync want small per-node patches and nested documents fight that | Consider **flat map + `parentId`** as canonical, tree as a view | Only if patch/identity outranks subtree-transform as the hot path |
| **Connectors / many-to-many links** become core product | **Tree + edge list** (light graph): `{ id, fromId, toId, … }` alongside the tree | Do **not** throw away the tree; containment stays hierarchical, associations are edges |

**v1 follow-ups:** unique ids; CRUD; JSON round-trip of the tree; no connectors yet; no id index until measured need.

**Update 2026-07-20:** Hybrid **`nodeReferences: Map<id, Node>`** adopted in `@canvas-engine/document` during implementation (same object refs as the tree). Remaining TBD: subtree delete, JSON serialization, broader CRUD — see [document-model.md](../document-model.md).

## References

- [Performant Paintings: Building a Canvas Render Engine (Mural / DEV)](https://dev.to/mural/performant-paintings-building-a-canvas-render-engine-4506) — DOM paint → canvas engines; hierarchical ASTs for domain objects  
- [THE PEACEVOID OS — Behance case study](https://www.behance.net/gallery/194480187/THE-PEACEVOID-OS-Case-Study)  
- [desktop-os-react-next](https://github.com/0xFrann/desktop-os-react-next) — Peacevoid OS interactive shell (DOM-first)
