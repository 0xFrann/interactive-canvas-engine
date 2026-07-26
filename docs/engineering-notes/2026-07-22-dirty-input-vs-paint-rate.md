# 2026-07-22 — Dirty flags: problem first (input rate vs paint rate)

## The confusion

“Dirty” sounded like an abstract pattern. It only clicked once we named a **concrete pain**: work repeated more often than the screen updates.

Patterns are solutions. **If there is no problem, the pattern is noise.**

## The problem

We already store `worldX`/`worldY` on nodes and **eagerly** `syncWorldSubtree` on every local move. Dragging a frame with many children looks correct in real time.

**Pain:** pointer events can fire **many times** between two paints. Eager sync runs a full subtree world rewrite on **every** move, even when only the **last** positions before paint matter for what the user sees.

Example: frame + 200 stickies; 3 pointermoves, then 1 paint.

| | Eager (today) | Dirty (defer derived refresh) |
|--|----------------|-------------------------------|
| 3 moves | 3 × sync ~201 worlds ≈ **603** writes | mark dirty (cheap) × 3 |
| 1 paint | draw using worlds | recompute ~201 **once**, then draw |

**Real-time animation still happens** — the screen updates on each paint with correct positions. Dirty does not mean “wait until drag ends to show motion.” It means: **don’t refresh every cached world at input rate if paint rate is lower.**

```text
pointer:  ·  ·  ·  ·  ·  ·     (many)
paint:    ┃           ┃       (fewer)

eager:    sync on every ·
dirty:    mark on · · · ; sync on ┃
```

## When dirty does *not* help

If every `pointermove` does `sync all → paint all` (one move per paint, full board), dirty mostly **reorders** the same work. Our demo is near that — so staying **eager** is fine at current scale.

## Related (different problem)

A **bitmap / layer while dragging** solves a different pain: expensive **draw** of many children mid-gesture. That can skip redraw (and sometimes skip world writes) until pointerup. Not the same as dirty; can combine later.

## Decision for this repo

- Implemented: single `dirtyRootId` + `ensureWorld()` ([ADR 014](../decisions/014-dirty-root-ensure-world.md)).
- Interview story: name the **input vs paint** mismatch first, then dirty as the deferral tool.
- Reality check: on some setups (e.g. synced macOS Chrome) drag looks 1:1 with frames — dirty still matters for Firefox/Windows/mobile, coalesced/raw input, main-thread safety, and catch-up after dropped frames ([cross-browser note](./2026-07-22-dirty-cross-browser-pointer.md)).

**Interview one-liner:** Dirty isn’t “nodes have fake data” — locals stay truth; the flag means cached world may be stale because we skipped work on purpose until a paint (or read) needs it, when input is hotter than frames.
