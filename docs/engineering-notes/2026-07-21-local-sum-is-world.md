# 2026-07-21 — Local sum is world; frame move needs no child rewrite

First scene-graph slice: `getWorldPosition` walks `parentId` and adds local `x`/`y`. That is why `updateNode` on a frame moves nested stickies on screen without touching their stored coords — the sum changes, not the children. Chose on-the-fly + `@canvas-engine/scene-graph` (ADR 005); cache/dirty parked for render pain.

**Interview one-liner:** Document stores parent-relative locals; world is the path sum — parent moves change descendants’ world for free.
