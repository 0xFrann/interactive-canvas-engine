import { describe, expect, it } from "vitest";
import { DocumentModel } from "@canvas-engine/document";
import { hitTest, resolveDropParent } from "../index";

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
    expect(hitTest(doc, { x: 130, y: 70 })).toBe(sticky.id);
    expect(hitTest(doc, { x: 110, y: 55 })).not.toBe(sticky.id);
  });

  it("can ignore a dragged subtree so drop targets skip self", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ height: 200, width: 200, x: 0, y: 0 });
    const sticky = doc.addNode({ height: 40, width: 40, x: 10, y: 10 });
    expect(hitTest(doc, { x: 20, y: 20 })).toBe(sticky.id);
    expect(hitTest(doc, { x: 20, y: 20 }, { ignoreSubtreeOf: sticky.id })).toBe(frame.id);
  });
});

describe("resolveDropParent", () => {
  it("reparents onto a frame when the cursor is inside that frame", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ height: 200, width: 200, x: 100, y: 100 });
    doc.selectNode("root");
    const loose = doc.addNode({ height: 40, width: 40, x: 0, y: 0 });

    expect(resolveDropParent(doc, loose.id, { x: 150, y: 150 })).toBe(frame.id);
  });

  it("reparents to root when the cursor leaves the parent box", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ height: 100, width: 100, x: 0, y: 0 });
    const sticky = doc.addNode({ height: 40, width: 40, x: 10, y: 10 });

    expect(sticky.parentId).toBe(frame.id);
    // Sticky can still overlap the frame; cursor outside decides detach.
    expect(resolveDropParent(doc, sticky.id, { x: 200, y: 200 })).toBe("root");
  });

  it("keeps the parent when the cursor stays inside even if the node overlaps the edge", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ height: 100, width: 100, x: 0, y: 0 });
    const sticky = doc.addNode({ height: 40, width: 40, x: 10, y: 10 });
    doc.selectNode(sticky.id);
    doc.updateNode({ x: 80, y: 80 });

    expect(sticky.parentId).toBe(frame.id);
    expect(resolveDropParent(doc, sticky.id, { x: 50, y: 50 })).toBeUndefined();
  });

  it("returns undefined when still inside the parent and cursor is not over another node", () => {
    const doc = new DocumentModel({ name: "Board" });
    doc.addNode({ height: 200, width: 200, x: 0, y: 0 });
    const sticky = doc.addNode({ height: 40, width: 40, x: 20, y: 20 });

    expect(resolveDropParent(doc, sticky.id, { x: 30, y: 30 })).toBeUndefined();
  });
});
