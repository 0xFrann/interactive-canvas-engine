# 2026-07-21 — Node drag: world delta → local update

Demo drag: `hitTest` → on move, `screenToWorld` delta applied with `updateNode` on locals. Parent drag moves children on screen because document syncs descendant `world*` while child locals stay put. No reparent-on-exit yet; cache/dirty still deferred until this write path feels hot.

**Interview one-liner:** Drag mutates local coords under the current parent; world (and nested visuals) follow from the maintained transform — separate from camera pan.
