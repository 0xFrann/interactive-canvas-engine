import { describe, expect, it } from "vitest";
import { DocumentModel } from "@canvas-engine/document";
import { getWorldPosition } from "../index";

describe("getWorldPosition", () => {
  it("sums locals along root → frame → sticky (and follows a frame move without rewriting sticky locals)", () => {
    const doc = new DocumentModel({ name: "Board" });

    const frame = doc.addNode({ x: 100, y: 50 });
    const sticky = doc.addNode({ x: 20, y: 10 });

    expect(getWorldPosition(doc, sticky.id)).toEqual({ x: 120, y: 60 });

    doc.selectNode(frame.id);
    doc.updateNode({ x: 200, y: 50 });

    expect(sticky.x).toBe(20);
    expect(sticky.y).toBe(10);
    expect(getWorldPosition(doc, sticky.id)).toEqual({ x: 220, y: 60 });
  });
});
