import { describe, expect, it, vi } from "vitest";
import { DocumentModel } from "@canvas-engine/document";
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH, renderDocument } from "../index";

function mockContext(canvasWidth = 800, canvasHeight = 600) {
  const calls: { op: string; args: unknown[] }[] = [];
  const ctx = {
    canvas: { height: canvasHeight, width: canvasWidth },
    clearRect: vi.fn((...args: unknown[]) => calls.push({ op: "clearRect", args })),
    fillRect: vi.fn((...args: unknown[]) => calls.push({ op: "fillRect", args })),
    fillStyle: "",
    lineWidth: 1,
    strokeRect: vi.fn((...args: unknown[]) => calls.push({ op: "strokeRect", args })),
    strokeStyle: "",
  };
  return { calls, ctx: ctx as unknown as CanvasRenderingContext2D, raw: ctx };
}

describe("renderDocument", () => {
  it("clears the canvas and draws a rect at each node's world position", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ x: 100, y: 50 });
    doc.addNode({ x: 20, y: 10 });

    const { ctx, raw } = mockContext();
    renderDocument(doc, ctx, { background: "#1a1a1a" });

    expect(raw.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(raw.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(raw.fillRect).toHaveBeenCalledWith(100, 50, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);
    expect(raw.fillRect).toHaveBeenCalledWith(120, 60, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);
    expect(raw.strokeRect).toHaveBeenCalledWith(
      frame.worldX,
      frame.worldY,
      DEFAULT_NODE_WIDTH,
      DEFAULT_NODE_HEIGHT,
    );
  });

  it("draws a stronger outline for the active node last", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ x: 100, y: 50 });
    doc.addNode({ x: 20, y: 10 });
    doc.selectNode(frame.id);

    const { ctx, raw } = mockContext();
    renderDocument(doc, ctx, { activeLineWidth: 3, activeStroke: "#f97316" });

    const strokes = raw.strokeRect.mock.calls;
    expect(strokes.at(-1)).toEqual([100, 50, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT]);
    expect(raw.lineWidth).toBe(3);
    expect(raw.strokeStyle).toBe("#f97316");
  });
});
