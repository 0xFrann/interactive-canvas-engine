# ADR 009: Isolated camera package with demo pan/zoom

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Camera

## Context

Renderer drew world coords as pixels. Need pan/zoom without rewriting document positions.

## Options

1. **`packages/camera`** — transforms + helpers; renderer/demo consume it.
2. **Fold into renderer** — fewer packages; hit-test still needs the math elsewhere.
3. **Transforms only, wire demo later** — thinner slice; board stays less demoable.

## Decision

- Add `@canvas-engine/camera` with `createCamera`, `worldToScreen`, `screenToWorld`, `panCamera`, `zoomCameraAt`, `applyCameraTransform`.
- Pass `camera` into `renderDocument`.
- Demo: wheel zoom-to-cursor, drag-empty / middle-button pan, click select via `screenToWorld`.

## Why

Camera is a core Canvas Core interview topic. Shipping demo gestures in the same slice proves the math end-to-end.

## Consequences

- Hit-testing (#5) should reuse `screenToWorld`.
- Stroke widths scale with `1/zoom` in the renderer for visibility.
