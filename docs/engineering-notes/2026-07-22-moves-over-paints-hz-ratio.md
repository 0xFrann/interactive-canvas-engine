# 2026-07-22 — moves/paints ≈ mouse Hz ÷ display Hz

Manual tests on one Mac:

| Display | Refresh | Observed moves/paints |
|---------|---------|------------------------|
| Built-in ProMotion | ~120Hz | ≈ **1:1** |
| Secondary monitor | 75Hz | ≈ **1.6** |

## Why

Pointer hardware and the display are **different clocks**.

- Many mice report at **~125Hz** (USB default); gaming mice higher.
- The screen (and RAF) run at **75Hz or 120Hz**.
- The browser often **batches** samples into one `pointermove` per frame (`getCoalescedEvents`).

Rough expectation:

| Display | 125Hz mouse ÷ refresh | Matches observation? |
|---------|----------------------|----------------------|
| 120Hz | 125 / 120 ≈ **1.04** | Yes → looks 1:1 |
| 75Hz | 125 / 75 ≈ **1.67** | Yes → ~1.6 |

So the **secondary monitor doesn’t generate more “engine paints”** — it **paints less often**, while the mouse keeps feeding samples. More samples land **per frame** → higher moves/paints. On 120Hz, frame rate almost matches mouse report rate → one sample per tick.

Absolute event rate can still be similar; the **ratio** is events (or coalesced samples) per RAF tick.

## Takeaway

Dirty + frame loop pay off when **input clock > display clock** (75Hz + normal mouse, mobile touch, Firefox variability, catch-up after jank). A 120Hz panel can hide that in casual testing — which is why multi-monitor checks matter.

**Interview one-liner:** moves/paints isn’t magic — it’s often HID poll rate over vsync; 125/75 ≈ 1.6, 125/120 ≈ 1.
