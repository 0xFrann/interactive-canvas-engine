# 2026-07-21 — World cache/dirty: early park (superseded by clearer problem framing)

Early note assumed on-the-fly world walks and “revisit at render.” We later denormalized world onto nodes (ADR 006) and shipped drag.

**Updated understanding:** see [2026-07-22 — Dirty flags: problem first](./2026-07-22-dirty-input-vs-paint-rate.md). Dirty helps when **derived** updates would run more often than **paints** (or than nodes you actually read). Eager sync remains correct for the demo.

**Interview one-liner:** Don’t lead with the pattern — lead with “pointer rate vs frame rate,” then dirty as optional deferral.
