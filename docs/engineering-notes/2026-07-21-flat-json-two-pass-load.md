# 2026-07-21 — Flat file in, tree + index out (two passes)

Disk cannot hold our `Map`s. Locked shape: metadata + flat `{ id, parentId, x, y }` rows + `activeNodeId`. Save walks `nodeReferences` and emits rows. Load must not call `addNode` in file order — a child can appear before its parent, and insert rules require `activeNode === parent`. Two passes: register every node with empty `children`, then link into parents, then restore active. Round-trip keeps the same-ref invariant (tree entry === index entry).

**Interview one-liner:** We persist a flat parentId list and rebuild the tree plus O(1) index in two passes so file order and interactive insert rules don’t break restore.
