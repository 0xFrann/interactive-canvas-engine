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
        { id: n1.id, parentId: "root", x: 0, y: 0 },
        { id: n2.id, parentId: n1.id, x: 10, y: 10 },
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
        { id: "2", parentId: "1", x: 10, y: 10 },
        { id: "1", parentId: "root", x: 0, y: 0 },
      ],
    });

    expect(loaded.children.get("1")).toBeDefined();
    expect(loaded.children.get("1")?.children.get("2")).toBe(loaded.nodeReferences.get("2"));
    expect(loaded.activeNode).toBe(loaded);
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
  });

  it("should prevent updating the root", () => {
    const doc = new DocumentModel({ name: "Board" });
    expect(() => doc.updateNode({ x: 1 })).toThrow("Root node cannot be updated");
  });
});
