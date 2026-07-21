# 2026-07-21 — Local coords make update O(1)

Tempting to “recursively update” children when a frame moves. Unnecessary if `x`/`y` are local to the parent: patch only the active node in place (same object in tree + index). Descendants keep their relative offsets; world position is a later scene-graph concern. Reparent stays a separate TBD.

**Interview one-liner:** With parent-relative coords, moving a group is a single property write — children don’t need a document walk.
