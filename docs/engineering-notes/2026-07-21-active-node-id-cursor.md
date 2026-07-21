# 2026-07-21 — Cursor is an id; object is a getter

Storing a live `activeNode` pointer duplicated what save already calls `activeNodeId`. Refactor: keep `activeNodeId` as source of truth; `activeNode` is a getter that resolves through the index (`getNode` / `nodeReferences`). Select becomes validate + assign id. Same convenience for callers, simpler internal state.

**Interview one-liner:** Selection is an id into the document index — a live object cursor is optional sugar, not a second source of truth.
