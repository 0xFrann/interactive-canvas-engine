# 2026-07-22 — Dirty still earns its keep (cross-browser pointer reality)

Research after seeing moves ≈ paints on one machine: **coalesced / hot input is real on some setups and not on others.** Dirty + a frame loop are not wasted — they protect the engine when the environment is less polite than a synced macOS Chrome drag.

## Cross-browser / cross-OS (expected pointer behavior)

| Environment | Expected pointer behavior | Why cache / dirty still matters |
|-------------|---------------------------|----------------------------------|
| Chrome / Safari (macOS) | Often tightly synced to frame rate | Still helps if frames drop; avoids redundant derived work when events stack |
| Firefox (all OS) | Highly variable sync; historically dispatches as events arrive, sometimes **above** frame rate | Dirty + coalesce absorb excess inputs |
| Chrome / Edge (Windows) | Mostly synced, but micro-stuttering common | Background load can queue multiple events between frames |
| Mobile (iOS / Android) | Touch can flood the main thread | High-frequency touch often outruns what the screen can draw |

## Why keep dirty-checking

Do **not** delete dirty / frame-deferred world sync. It guards three bottlenecks:

1. **Uncoalesced / raw input** — Hyper-accurate tracking (e.g. drawing) needs `getCoalescedEvents()` / hardware poll rates (hundreds of signals/sec). Without deferral you’d chase hundreds of syncs or paints per second.
2. **Heavy compute safety** — Even at ~1 `pointermove` per frame, doing layout, intersections, or matrix walks **inside the event handler** blocks the main thread. Postpone derived + paint work to the dedicated loop so input stays responsive.
3. **Frame dropping** — After a lag spike the browser may queue several pointer events. Without dirty / coalesce, the app can try to catch up by doing redundant derived work back-to-back and **compound** the lag.

## How this fits our engine

- Default clock: display-tied RAF ([runtime](../runtime.md)); optional 30fps for reduced motion.
- World: `dirtyRootId` + `ensureWorld` on the tick ([ADR 014](../decisions/014-dirty-root-ensure-world.md)).
- Demo samples coalesced events when present; Burst proves coalesce when the OS is quiet.

**Interview one-liner:** Pointer rate isn’t universal — macOS Chrome may look 1:1 with vsync, Firefox/Windows/mobile often won’t; dirty + a frame loop are insurance for uncoalesced input, main-thread safety, and catch-up after dropped frames.
