# Camera

## What it is

View transform between **board (world)** and **canvas (screen)**. Package: `@canvas-engine/camera`.

## Why it exists

An infinite board cannot store every sticky in pixel space. Pan/zoom change how we look; document world stays put. Hit-testing needs the inverse (click → world).

## How it works here

- **State:** `{ x, y, zoom }` — `(x,y)` is the world point at the canvas origin; `zoom` scales world → screen.
- **Formulas:** `screen = (world - camera) * zoom`, `world = screen / zoom + camera`.
- **Helpers:** `worldToScreen`, `screenToWorld`, `panCamera`, `zoomCameraAt` (zoom toward a screen point), `applyCameraTransform` (canvas `setTransform`).
- **Renderer:** optional `camera` on `renderDocument`; draws in world space after the transform; stroke widths divide by zoom so outlines stay readable.
- **Demo:** wheel zoom, drag empty / middle-drag pan, click select (screen → world → hit-test).

## Alternatives considered

- Fold into renderer — rejected; camera is its own interview topic and hit-test needs it too.
- Camera look-at center vs origin offset — origin offset is simpler for v1.

## What I would do differently

- Clamp pan to content bounds later if the board feels lost.

## Open questions

- [ ] Fit-to-content / zoom-to-selection
- [ ] High-DPI devicePixelRatio handling for the canvas backing store

## Trade-offs

| Choice | Gain | Cost |
|--------|------|------|
| Separate package | Clear world↔screen story | Extra wiring |
| Origin-based pan | Easy math | Less “look at center” intuition |
| Zoom at cursor | Feels natural | Must adjust pan when zoom changes |

## How Mural probably solves this

Viewport camera with zoom limits, transform stack shared by paint and interaction, possibly inertia / trackpad gestures.

## References

- [Renderer](./renderer.md)
- [ADR 009](./decisions/009-camera-package.md)
