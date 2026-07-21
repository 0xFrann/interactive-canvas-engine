import { describe, expect, it } from "vitest";
import { DocumentModel } from "@canvas-engine/document";
import { hitTest } from "../index";

describe("hitTest", () => {
  it("returns undefined when the point misses every node", () => {
    const doc = new DocumentModel({ name: "Board" });
    doc.addNode({ height: 50, width: 50, x: 100, y: 100 });
    expect(hitTest(doc, { x: 10, y: 10 })).toBeUndefined();
  });

  it("hits a node by its world box", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ height: 120, width: 200, x: 100, y: 50 });
    expect(hitTest(doc, { x: 150, y: 80 })).toBe(frame.id);
  });

  it("prefers the top-most overlapping node (later in the index)", () => {
    const doc = new DocumentModel({ name: "Board" });
    doc.addNode({ height: 100, width: 100, x: 0, y: 0 });
    doc.selectNode("root");
    const top = doc.addNode({ height: 100, width: 100, x: 20, y: 20 });
    expect(hitTest(doc, { x: 50, y: 50 })).toBe(top.id);
  });

  it("uses world position for nested nodes (parent local does not fool the pick)", () => {
    const doc = new DocumentModel({ name: "Board" });
    doc.addNode({ height: 160, width: 200, x: 100, y: 50 });
    const sticky = doc.addNode({ height: 60, width: 80, x: 20, y: 10 });
    // Sticky world = (120, 60)
    expect(hitTest(doc, { x: 130, y: 70 })).toBe(sticky.id);
    expect(hitTest(doc, { x: 110, y: 55 })).not.toBe(sticky.id);
  });
});
