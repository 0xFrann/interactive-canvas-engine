# 2026-07-21 — Reparent is unlink + relink, not a recursive rewrite

Moving a frame under another frame only changes one edge: leave the old parent’s `children`, update `parentId`, enter the new parent’s `children`. The subtree rides along because it hangs off the moved node’s own Map. Walk ancestors of the new parent to reject cycles. Local `x`/`y` stay put — world jump is a later transform problem.

**Interview one-liner:** Reparent is a constant-time edge rewrite on the tree plus a cycle check — not a deep copy of descendants.
