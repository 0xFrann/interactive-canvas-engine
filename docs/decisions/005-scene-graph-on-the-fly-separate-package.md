# ADR 005: Scene graph — on-the-fly world, separate package

- **Status:** Superseded by [ADR 006](./006-world-on-document-scene-facade.md)
- **Date:** 2026-07-21
- **Topic:** Scene graph

## Context

Document nodes store **local** `x`/`y`. Renderers (and later hit-testing) need **world** position. We need to decide how to derive it and where that logic lives.

## Options

1. **On the fly** — walk/accumulate parent locals whenever world is asked. Simple, always fresh; cost grows with depth × ask rate.
2. **Cache + dirty** — store world (or matrix); invalidate node + descendants on move/reparent. Faster repeated reads; invalidation bugs.
3. **API on `packages/document`** — document answers world. Fewer packages; mixes storage with derived spatial math.
4. **New package reading the document** — clear boundary (relative state vs derived/render-facing). More wiring.

## Decision

- Compute world **on the fly** (no cache/dirty in v1).
- Put the API in a **new package** (e.g. scene-graph) that reads the document — not inside `@canvas-engine/document`.

## Why

Create + occasional drag; no paint loop yet — parent-chain walks are cheap enough. Separate package keeps document = relative truth / CRUD and leaves room for renderer/camera to depend on scene without bloating the document model. Cache/dirty parked until render-time pain is measurable ([engineering note](../engineering-notes/2026-07-21-world-cache-revisit-at-render.md)).

## Consequences

- First slice: derive world from local chain via the new package.
- Document stays free of derived spatial caches.
- Follow-up: revisit caching when renderer asks world at high frequency (roadmap #3).
