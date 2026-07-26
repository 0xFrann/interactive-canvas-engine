# 2026-07-22 — Fine short drags show big engine savings; shaking barely does

Manual HUD checks (events → paints):

| Gesture | Typical engine saved |
|---------|----------------------|
| Short / fine / precise moves | Often **large** (many events, few paints) |
| Shaking / messy fast motion | Often **~0–2%** |

## Why

**Engine saved** only counts `pointermove` **dispatches** vs our **paints** — not coalesced hardware samples.

- **Short fine drag:** lasts only a few display frames but the OS still fires several `pointermove`s in that window → many events, 1–2 paints → high %. The gesture is short, so the ratio looks dramatic.
- **Shaking:** long gesture spanning many frames. Browsers usually deliver ~**one dispatch per refresh** (extra polls go into `getCoalescedEvents`). Events ≈ paints → almost nothing left for the runtime to coalesce. The browser already did the heavy merge; sample count may still be high, but that’s **not** engine savings.

So: messy motion doesn’t “need” more engine coalesce — the browser is already batching to vsync. Fine short motion is where multiple dispatches still pile up between our ticks.

**Interview one-liner:** High engine saved on precise nudges is few frames + several events; shaking looks 1:1 because the browser already emits about one `pointermove` per refresh.
