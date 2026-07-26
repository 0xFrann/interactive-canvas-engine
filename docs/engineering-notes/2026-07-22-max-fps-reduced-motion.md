# 2026-07-22 — 30fps as opt-in reduced motion, not the default clock

Default clock stays display-tied (RAF). A learning / a11y switch sets `maxFps: 30`: still scheduled via RAF, but listener ticks wait ~33ms so motion is calmer and the HUD can show fewer paints vs moves. Do not underclock by default — only when the user (or `prefers-reduced-motion`) asks.

**Interview one-liner:** Match the display unless you’re deliberately reducing motion; throttle with RAF timestamps, not a separate `setInterval` game loop.
