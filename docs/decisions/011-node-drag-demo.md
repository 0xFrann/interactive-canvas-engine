# ADR 011: Node drag in the demo (local updates; no reparent-on-exit yet)

- **Status:** Accepted
- **Date:** 2026-07-21
- **Topic:** Interaction / document

## Context

After hit-testing, we need continuous move. Reparent-when-leaving-parent and cache/dirty are later baby steps.

## Options

1. **Demo-only drag** — pointer → world delta → `updateNode` locals.
2. **Interaction package** — extract tools now.
3. **Include reparent-on-exit in the same slice**.

## Decision

Ship **demo node drag** only: select on pointerdown, after a small threshold apply world-space delta to local `x`/`y` via `updateNode`. Empty/middle drag still pans the camera. No reparent-on-drop yet.

## Why

Proves the write path under real pointer frequency before inventing dirty flags or drop targets. Keeps scope to one gesture.

## Consequences

- Dragging a parent already moves children visually (world sync).
- Next optional: reparent when dropping outside the current parent’s box.
- Then evaluate cache/dirty if subtree sync during drag hurts.
