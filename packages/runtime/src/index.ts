import type { FrameListener, FrameLoop, FrameLoopOptions } from "./types";

function defaultScheduleFrame(callback: (time: number) => void): number {
  return requestAnimationFrame(callback);
}

function defaultCancelFrame(handle: number): void {
  cancelAnimationFrame(handle);
}

/**
 * Display-tied frame clock: coalesce work with `requestFrame()`.
 * Optional `maxFps` skips listener ticks until the interval elapses (still RAF-driven).
 */
export function createFrameLoop(options: FrameLoopOptions = {}): FrameLoop {
  const scheduleFrame = options.scheduleFrame ?? defaultScheduleFrame;
  const cancelFrame = options.cancelFrame ?? defaultCancelFrame;

  const beforePaint: FrameListener[] = [];
  const paint: FrameListener[] = [];
  let pendingHandle: number | null = null;
  let epoch = 0;
  let tickCount = 0;
  let requestCount = 0;
  let stopped = false;
  let maxFps: number | null = options.maxFps ?? null;
  let lastTickTime = Number.NEGATIVE_INFINITY;

  const unsubscribe = (list: FrameListener[], listener: FrameListener): (() => void) => {
    list.push(listener);
    return () => {
      const index = list.indexOf(listener);
      if (index !== -1) {
        list.splice(index, 1);
      }
    };
  };

  const cancelPending = (): void => {
    if (pendingHandle === null) {
      return;
    }
    epoch += 1;
    cancelFrame(pendingHandle);
    pendingHandle = null;
  };

  const runScheduled = (time: number, scheduledEpoch: number): void => {
    pendingHandle = null;
    if (stopped || scheduledEpoch !== epoch) {
      return;
    }

    if (maxFps !== null && maxFps > 0 && Number.isFinite(lastTickTime)) {
      const minIntervalMs = 1000 / maxFps;
      if (time - lastTickTime < minIntervalMs) {
        // Still waiting — keep a pending RAF so further requestFrames coalesce.
        pendingHandle = scheduleFrame((nextTime) => {
          runScheduled(nextTime, scheduledEpoch);
        });
        return;
      }
    }

    lastTickTime = time;
    tickCount += 1;
    for (const listener of beforePaint) {
      listener(time);
    }
    for (const listener of paint) {
      listener(time);
    }
  };

  return {
    cancelPending,

    get maxFps() {
      return maxFps;
    },

    onBeforePaint(listener: FrameListener): () => void {
      return unsubscribe(beforePaint, listener);
    },

    onPaint(listener: FrameListener): () => void {
      return unsubscribe(paint, listener);
    },

    get requestCount() {
      return requestCount;
    },

    requestFrame(): void {
      requestCount += 1;
      if (stopped || pendingHandle !== null) {
        return;
      }
      const scheduledEpoch = epoch;
      pendingHandle = scheduleFrame((time) => {
        runScheduled(time, scheduledEpoch);
      });
    },

    setMaxFps(next: number | null): void {
      maxFps = next;
    },

    stop(): void {
      stopped = true;
      cancelPending();
      beforePaint.length = 0;
      paint.length = 0;
    },

    get tickCount() {
      return tickCount;
    },
  };
}

export type {
  CancelFrame,
  FrameListener,
  FrameLoop,
  FrameLoopOptions,
  ScheduleFrame,
} from "./types";
