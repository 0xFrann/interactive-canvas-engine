import { describe, expect, it } from "vitest";
import { DocumentModel } from "../index";

describe("createDocument", () => {
  it("should create a new document with a valid structure", () => {
    const doc = new DocumentModel({ name: "Test Document" });

    expect(doc).toBeDefined();
    expect(doc.id).toBe("root");
    expect(doc.metadata.name).toEqual("Test Document");
    expect(doc.children.size).toEqual(doc.nodeReferences.size);
    expect([...doc.children.keys()]).toEqual([]);
    expect(doc.activeNodeId).toBe("root");
    expect(doc.activeNode).toEqual(doc);
  });

  it("should add a new node under the active node with a generated id", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    const created = doc.addNode({ x: 0, y: 0 });

    expect(created.id).not.toBe("root");
    expect(created.parentId).toBe("root");
    const fromTree = doc.children.get(created.id);
    const fromIndex = doc.nodeReferences.get(created.id);
    expect(fromTree).toBeDefined();
    expect(fromIndex).toBe(fromTree);
    expect(doc.activeNodeId).toBe(created.id);
    expect(doc.activeNode).toBe(fromTree);
  });

  it("should add a nested node under the current active node", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    const parent = doc.addNode({ x: 0, y: 0 });
    const child = doc.addNode({ x: 0, y: 0 });

    expect(child.parentId).toBe(parent.id);
    expect(parent.children.get(child.id)).toBe(child);
    expect(doc.nodeReferences.get(child.id)).toBe(child);
  });

  it("should generate unique ids for each add", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    const a = doc.addNode({ x: 0, y: 0 });
    doc.selectNode("root");
    const b = doc.addNode({ x: 1, y: 1 });

    expect(a.id).not.toBe(b.id);
    expect(doc.nodeReferences.size).toBe(2);
  });

  it("should delete a node and its children", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    const n1 = doc.addNode({ x: 0, y: 0 });
    const n2 = doc.addNode({ x: 0, y: 0 });
    const n4 = doc.addNode({ x: 0, y: 0 });
    doc.selectNode(n1.id);
    const n3 = doc.addNode({ x: 0, y: 0 });
    doc.selectNode(n1.id);
    doc.deleteNode(n1.id);

    expect(doc.children.size).toEqual(0);
    expect(doc.nodeReferences.size).toEqual(0);
    expect(doc.activeNodeId).toBe("root");
    expect(doc.activeNode).toEqual(doc);
    expect(doc.nodeReferences.get(n2.id)).toBeUndefined();
    expect(doc.nodeReferences.get(n3.id)).toBeUndefined();
    expect(doc.nodeReferences.get(n4.id)).toBeUndefined();
  });

  it("should add under root after deleting the previous active child", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    const n1 = doc.addNode({ x: 0, y: 0 });
    doc.deleteNode(n1.id);

    const n2 = doc.addNode({ x: 0, y: 0 });
    expect(n2.parentId).toBe("root");
    expect(doc.children.get(n2.id)).toBe(n2);
  });

  it("should nest under whichever node is active", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    const frame = doc.addNode({ x: 0, y: 0 });
    doc.selectNode("root");
    const sibling = doc.addNode({ x: 1, y: 1 });

    expect(sibling.parentId).toBe("root");
    expect(frame.children.size).toBe(0);
    expect(doc.children.get(sibling.id)).toBe(sibling);
  });

  it("should save a flat document without nested children or nodeReferences", () => {
    const doc = new DocumentModel({ name: "Board" });
    const n1 = doc.addNode({ x: 0, y: 0 });
    const n2 = doc.addNode({ x: 10, y: 10 });

    const saved = doc.save();

    expect(saved.metadata).toEqual({ name: "Board" });
    expect(saved.activeNodeId).toBe(n2.id);
    expect(saved.nodes).toEqual(
      expect.arrayContaining([
        { height: 80, id: n1.id, parentId: "root", width: 120, x: 0, y: 0 },
        { height: 80, id: n2.id, parentId: n1.id, width: 120, x: 10, y: 10 },
      ]),
    );
    expect(saved.nodes).toHaveLength(2);
    expect(saved).not.toHaveProperty("children");
    expect(saved).not.toHaveProperty("nodeReferences");
    for (const row of saved.nodes) {
      expect(row).not.toHaveProperty("children");
    }
  });

  it("should round-trip save → load with same tree and index identity", () => {
    const doc = new DocumentModel({ name: "Board" });
    const n1 = doc.addNode({ x: 0, y: 0 });
    const n2 = doc.addNode({ x: 10, y: 10 });
    doc.selectNode(n1.id);

    const loaded = DocumentModel.load(doc.save());

    expect(loaded.metadata.name).toBe("Board");
    expect(loaded.activeNodeId).toBe(n1.id);
    expect(loaded.activeNode).toBe(loaded.nodeReferences.get(n1.id));
    expect(loaded.children.get(n1.id)).toBe(loaded.nodeReferences.get(n1.id));
    expect(loaded.children.get(n1.id)?.children.get(n2.id)).toBe(loaded.nodeReferences.get(n2.id));
    expect(loaded.nodeReferences.size).toBe(2);
  });

  it("should load when a child appears before its parent in the file", () => {
    const loaded = DocumentModel.load({
      activeNodeId: "root",
      metadata: { name: "Board" },
      nodes: [
        { height: 80, id: "2", parentId: "1", width: 120, x: 10, y: 10 },
        { height: 100, id: "1", parentId: "root", width: 200, x: 0, y: 0 },
      ],
    });

    expect(loaded.children.get("1")).toBeDefined();
    expect(loaded.children.get("1")?.children.get("2")).toBe(loaded.nodeReferences.get("2"));
    expect(loaded.children.get("1")?.width).toBe(200);
    expect(loaded.nodeReferences.get("2")?.height).toBe(80);
    expect(loaded.activeNodeId).toBe("root");
    expect(loaded.activeNode).toBe(loaded);
  });

  it("should select by id without storing a separate object cursor", () => {
    const doc = new DocumentModel({ name: "Board" });
    const created = doc.addNode({ x: 0, y: 0 });
    doc.selectNode("root");
    expect(doc.activeNodeId).toBe("root");
    doc.selectNode(created.id);
    expect(doc.activeNodeId).toBe(created.id);
    expect(doc.activeNode).toBe(doc.nodeReferences.get(created.id));
  });

  it("should update the active node's local x/y in place", () => {
    const doc = new DocumentModel({ name: "Board" });
    const created = doc.addNode({ x: 0, y: 0 });

    const updated = doc.updateNode({ x: 50, y: 25 });

    expect(updated.x).toBe(50);
    expect(updated.y).toBe(25);
    expect(updated).toBe(created);
    expect(doc.children.get(created.id)).toBe(updated);
    expect(doc.nodeReferences.get(created.id)).toBe(updated);
  });

  it("should not change a child's local coords when the parent is updated", () => {
    const doc = new DocumentModel({ name: "Board" });
    const parent = doc.addNode({ x: 0, y: 0 });
    const child = doc.addNode({ x: 10, y: 10 });
    doc.selectNode(parent.id);
    doc.updateNode({ x: 100, y: 200 });

    expect(child.x).toBe(10);
    expect(child.y).toBe(10);
    // Worlds stay stale until ensureWorld (dirty deferral).
    expect(parent.worldX).toBe(0);
    expect(parent.worldY).toBe(0);
    expect(child.worldX).toBe(10);
    expect(child.worldY).toBe(10);

    doc.ensureWorld();
    expect(parent.worldX).toBe(100);
    expect(parent.worldY).toBe(200);
    expect(child.worldX).toBe(110);
    expect(child.worldY).toBe(210);
  });

  it("should defer subtree world sync across multiple updates until ensureWorld", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ x: 0, y: 0 });
    const sticky = doc.addNode({ x: 10, y: 10 });
    doc.selectNode(frame.id);

    doc.updateNode({ x: 50, y: 0 });
    doc.updateNode({ x: 100, y: 0 });
    doc.updateNode({ x: 150, y: 0 });

    expect(frame.x).toBe(150);
    expect(frame.worldX).toBe(0);
    expect(sticky.worldX).toBe(10);

    doc.ensureWorld();
    expect(frame.worldX).toBe(150);
    expect(sticky.worldX).toBe(160);
  });

  it("should flush a previous dirty root before marking a different node dirty", () => {
    const doc = new DocumentModel({ name: "Board" });
    const a = doc.addNode({ x: 0, y: 0 });
    doc.selectNode("root");
    const b = doc.addNode({ x: 10, y: 0 });

    doc.selectNode(a.id);
    doc.updateNode({ x: 40 });
    expect(a.worldX).toBe(0);

    doc.selectNode(b.id);
    doc.updateNode({ x: 80 });
    expect(a.worldX).toBe(40);
    expect(b.worldX).toBe(10);

    doc.ensureWorld();
    expect(b.worldX).toBe(80);
  });

  it("should set world from parent world + local on add", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ x: 100, y: 50 });
    const sticky = doc.addNode({ x: 20, y: 10 });

    expect(frame.worldX).toBe(100);
    expect(frame.worldY).toBe(50);
    expect(sticky.worldX).toBe(120);
    expect(sticky.worldY).toBe(60);
  });

  it("should default width/height on add and allow size updates without moving world", () => {
    const doc = new DocumentModel({ name: "Board" });
    const created = doc.addNode({ x: 10, y: 20 });
    expect(created.width).toBe(120);
    expect(created.height).toBe(80);

    const sized = doc.addNode({ height: 40, width: 200, x: 0, y: 0 });
    expect(sized.width).toBe(200);
    expect(sized.height).toBe(40);

    doc.selectNode(created.id);
    doc.updateNode({ height: 50, width: 90 });
    expect(created.width).toBe(90);
    expect(created.height).toBe(50);
    expect(created.worldX).toBe(10);
    expect(created.worldY).toBe(20);
  });

  it("should prevent updating the root", () => {
    const doc = new DocumentModel({ name: "Board" });
    expect(() => doc.updateNode({ x: 1 })).toThrow("Root node cannot be updated");
  });

  it("should reparent the active node under a new parent and keep the subtree", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frameA = doc.addNode({ x: 0, y: 0 });
    doc.selectNode("root");
    const frameB = doc.addNode({ x: 20, y: 20 });
    doc.selectNode(frameA.id);
    const sticky = doc.addNode({ x: 5, y: 5 });

    expect(frameA.worldX).toBe(0);
    expect(frameA.worldY).toBe(0);
    expect(sticky.worldX).toBe(5);
    expect(sticky.worldY).toBe(5);

    doc.selectNode(frameA.id);
    doc.reparentNode(frameB.id);

    expect(frameA.parentId).toBe(frameB.id);
    expect(doc.children.has(frameA.id)).toBe(false);
    expect(frameB.children.get(frameA.id)).toBe(frameA);
    expect(frameA.children.get(sticky.id)).toBe(sticky);
    expect(sticky.parentId).toBe(frameA.id);
    expect(doc.nodeReferences.get(frameA.id)).toBe(frameA);
    expect(doc.nodeReferences.get(sticky.id)).toBe(sticky);
    expect(doc.activeNodeId).toBe(frameA.id);
    expect(doc.activeNode).toBe(frameA);

    expect(frameA.worldX).toBe(0);
    expect(frameA.worldY).toBe(0);
    expect(frameA.x).toBe(-20);
    expect(frameA.y).toBe(-20);
    expect(sticky.x).toBe(5);
    expect(sticky.y).toBe(5);
    expect(sticky.worldX).toBe(5);
    expect(sticky.worldY).toBe(5);
  });

  it("should restore world on load from locals only (world not in file)", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ x: 100, y: 50 });
    doc.addNode({ x: 20, y: 10 });
    const saved = doc.save();
    expect(saved.nodes[0]).not.toHaveProperty("worldX");

    const loaded = DocumentModel.load(saved);
    const loadedFrame = loaded.nodeReferences.get(frame.id)!;
    const loadedSticky = [...loadedFrame.children.values()][0]!;

    expect(loadedFrame.worldX).toBe(100);
    expect(loadedFrame.worldY).toBe(50);
    expect(loadedSticky.worldX).toBe(120);
    expect(loadedSticky.worldY).toBe(60);
  });

  it("should reparent onto root", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ x: 0, y: 0 });
    const sticky = doc.addNode({ x: 5, y: 5 });

    doc.selectNode(sticky.id);
    doc.reparentNode("root");

    expect(sticky.parentId).toBe("root");
    expect(frame.children.has(sticky.id)).toBe(false);
    expect(doc.children.get(sticky.id)).toBe(sticky);
  });

  it("should reject reparenting under a descendant (cycle)", () => {
    const doc = new DocumentModel({ name: "Board" });
    const frame = doc.addNode({ x: 0, y: 0 });
    const sticky = doc.addNode({ x: 5, y: 5 });

    doc.selectNode(frame.id);
    expect(() => doc.reparentNode(sticky.id)).toThrow(
      "Cannot reparent a node under itself or its descendant",
    );
  });

  it("should prevent reparenting the root", () => {
    const doc = new DocumentModel({ name: "Board" });
    doc.addNode({ x: 0, y: 0 });
    doc.selectNode("root");
    expect(() => doc.reparentNode("root")).toThrow("Root node cannot be reparented");
  });
});
