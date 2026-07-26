/** Callback scheduled by the host clock (RAF in browser, fake in tests). */
type ScheduleFrame = (callback: (time: number) => void) => number;

type CancelFrame = (handle: number) => void;

type FrameListener = (time: number) => void;

interface FrameLoopOptions {
  /** Defaults to `requestAnimationFrame`. Inject in tests. */
  scheduleFrame?: ScheduleFrame;
  /** Defaults to `cancelAnimationFrame`. */
  cancelFrame?: CancelFrame;
  /**
   * Cap listener ticks (e.g. 30 for reduced motion).
   * Still driven by RAF — early callbacks reschedule until the interval elapses.
   * `null` = every animation frame (display rate).
   */
  maxFps?: number | null;
}

interface FrameLoop {
  /** Coalesce: many calls → at most one tick on the next scheduled frame. */
  requestFrame(): void;
  /** Runs before paint listeners (e.g. apply pending input, `doc.ensureWorld()`). */
  onBeforePaint(listener: FrameListener): () => void;
  /** Runs after beforePaint (e.g. `renderDocument`). */
  onPaint(listener: FrameListener): () => void;
  /** Cancel a pending scheduled frame; listeners stay registered. */
  cancelPending(): void;
  /** Drop pending frame and clear all listeners. */
  stop(): void;
  /**
   * Cap ticks per second (`30`) or `null` for display refresh.
   * Does not use setInterval — still RAF-tied.
   */
  setMaxFps(maxFps: number | null): void;
  readonly maxFps: number | null;
  /** How many ticks have run. */
  readonly tickCount: number;
  /** How many times `requestFrame` was called (includes coalesced no-ops). */
  readonly requestCount: number;
}

export type { CancelFrame, FrameListener, FrameLoop, FrameLoopOptions, ScheduleFrame };
