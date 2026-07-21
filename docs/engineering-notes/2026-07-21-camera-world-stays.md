# 2026-07-21 — Camera: world stays; the view moves

`screen = (world - camera) * zoom`. Zooming toward the cursor rewrites pan so the world point under the pointer stays put. Demo pan/zoom proved the round-trip: wheel and drag never mutate sticky locals/world — only the camera.

**Interview one-liner:** Document stores board space; camera is a view transform — paint and hits both go through world↔screen.
