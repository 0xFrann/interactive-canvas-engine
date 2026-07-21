import { describe, expect, it, vi } from "vitest";
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH, DocumentModel } from "@canvas-engine/document";
import { renderDocument } from "../index";

function mockContext(canvasWidth = 800, canvasHeight = 600) {
  const ctx = {
    canvas: { height: canvasHeight, width: canvasWidth },
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
    lineWidth: 1,
    strokeRect: vi.fn(),
    strokeStyle: "",
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, raw: ctx };
}

describe("renderDocument", () => {
  it("draws each node using its width and height at world position", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ height: 120, width: 200, x: 100, y: 50 });
    doc.addNode({ x: 20, y: 10 });

    const { ctx, raw } = mockContext();
    renderDocument(doc, ctx, { background: "#1a1a1a" });

    expect(raw.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(raw.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(raw.fillRect).toHaveBeenCalledWith(100, 50, 200, 120);
    expect(raw.fillRect).toHaveBeenCalledWith(120, 60, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);
    expect(raw.strokeRect).toHaveBeenCalledWith(100, 50, frame.width, frame.height);
  });

  it("draws a stronger outline for the active node last", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ height: 90, width: 160, x: 100, y: 50 });
    doc.addNode({ x: 20, y: 10 });
    doc.selectNode(frame.id);

    const { ctx, raw } = mockContext();
    renderDocument(doc, ctx, { activeLineWidth: 3, activeStroke: "#f97316" });

    const strokes = raw.strokeRect.mock.calls;
    expect(strokes.at(-1)).toEqual([100, 50, 160, 90]);
    expect(raw.lineWidth).toBe(3);
    expect(raw.strokeStyle).toBe("#f97316");
  });
});
