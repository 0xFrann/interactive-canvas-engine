# ADR 010: Hit-testing package (world-space pick)

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Hit testing

## Context

Demo duplicated AABB pick logic. Node drag needs a shared pick API. Camera already owns screen→world.

## Options

1. **`packages/hit-testing`** — `hitTest(doc, worldPoint)`.
2. **Leave in demo** until drag.
3. **Put on document** — mixes CRUD with spatial query.

## Decision

Add `@canvas-engine/hit-testing` with world-space `hitTest`. Demo switches to it. Linear scan; top-most = last map match. QuadTree deferred.

## Why

Baby step before drag. Clear boundary: camera transforms, hit-testing picks, document stores boxes.

## Consequences

- Next: node drag uses this pick.
- Cache/dirty still deferred until drag load is real.
