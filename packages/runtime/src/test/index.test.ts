import { describe, expect, it, vi } from "vitest";
import { createFrameLoop } from "../index";

describe("createFrameLoop", () => {
  it("coalesces many requestFrame calls into one tick", () => {
    const scheduled: { cb: ((time: number) => void) | null } = { cb: null };
    const scheduleFrame = vi.fn((callback: (time: number) => void) => {
      scheduled.cb = callback;
      return 1;
    });
    const cancelFrame = vi.fn();

    const loop = createFrameLoop({ cancelFrame, scheduleFrame });
    const before = vi.fn();
    const paint = vi.fn();
    loop.onBeforePaint(before);
    loop.onPaint(paint);

    loop.requestFrame();
    loop.requestFrame();
    loop.requestFrame();

    expect(scheduleFrame).toHaveBeenCalledTimes(1);
    expect(before).not.toHaveBeenCalled();
    expect(paint).not.toHaveBeenCalled();
    expect(loop.requestCount).toBe(3);

    scheduled.cb?.(16);
    expect(before).toHaveBeenCalledTimes(1);
    expect(paint).toHaveBeenCalledTimes(1);
    expect(loop.tickCount).toBe(1);

    loop.requestFrame();
    expect(scheduleFrame).toHaveBeenCalledTimes(2);
    scheduled.cb?.(32);
    expect(loop.tickCount).toBe(2);
  });

  it("runs beforePaint before paint", () => {
    const scheduled: { cb: ((time: number) => void) | null } = { cb: null };
    const order: string[] = [];
    const loop = createFrameLoop({
      cancelFrame: () => undefined,
      scheduleFrame: (callback) => {
        scheduled.cb = callback;
        return 1;
      },
    });

    loop.onBeforePaint(() => {
      order.push("before");
    });
    loop.onPaint(() => {
      order.push("paint");
    });
    loop.requestFrame();
    scheduled.cb?.(0);

    expect(order).toEqual(["before", "paint"]);
  });

  it("cancelPending drops the scheduled tick without running listeners", () => {
    const scheduled: { cb: ((time: number) => void) | null } = { cb: null };
    let handle = 0;
    const cancelFrame = vi.fn();
    const loop = createFrameLoop({
      cancelFrame,
      scheduleFrame: (callback) => {
        scheduled.cb = callback;
        handle += 1;
        return handle;
      },
    });
    const paint = vi.fn();
    loop.onPaint(paint);
    loop.requestFrame();
    loop.cancelPending();

    expect(cancelFrame).toHaveBeenCalledWith(1);
    scheduled.cb?.(0);
    expect(paint).not.toHaveBeenCalled();
  });

  it("stop prevents further requestFrame and clears listeners", () => {
    const scheduleFrame = vi.fn(() => 1);
    const loop = createFrameLoop({
      cancelFrame: () => undefined,
      scheduleFrame,
    });
    const paint = vi.fn();
    loop.onPaint(paint);
    loop.stop();
    loop.requestFrame();

    expect(scheduleFrame).not.toHaveBeenCalled();
  });

  it("maxFps skips listener ticks until the interval elapses (still RAF)", () => {
    const scheduled: { cb: ((time: number) => void) | null } = { cb: null };
    let handle = 0;
    const scheduleFrame = vi.fn((callback: (time: number) => void) => {
      scheduled.cb = callback;
      handle += 1;
      return handle;
    });

    const loop = createFrameLoop({
      cancelFrame: () => undefined,
      maxFps: 30,
      scheduleFrame,
    });
    const paint = vi.fn();
    loop.onPaint(paint);

    loop.requestFrame();
    scheduled.cb?.(0);
    expect(paint).toHaveBeenCalledTimes(1);

    loop.requestFrame();
    scheduled.cb?.(16);
    // ~16ms later at 30fps (~33ms) — reschedule, no second paint yet
    expect(paint).toHaveBeenCalledTimes(1);
    expect(scheduleFrame.mock.calls.length).toBeGreaterThan(2);

    scheduled.cb?.(34);
    expect(paint).toHaveBeenCalledTimes(2);
    expect(loop.tickCount).toBe(2);
  });
});
