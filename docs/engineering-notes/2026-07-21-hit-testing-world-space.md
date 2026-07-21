# 2026-07-21 — Hit-test in world space, after the camera

Picking is `screenToWorld` then an AABB against `worldX/Y` + size. Extracted from the demo into `@canvas-engine/hit-testing` so drag can reuse one API. Top-most = last match in `nodeReferences` until we have real z-order.

**Interview one-liner:** Camera maps the click into board space; hit-testing asks which node’s world box contains that point — keep those two steps separate.
