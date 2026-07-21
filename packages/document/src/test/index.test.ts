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

  it("should add a new node to the document root", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });
    const fromTree = doc.children.get("1");
    const fromIndex = doc.nodeReferences.get("1");
    expect(fromTree).toBeDefined();
    expect(fromIndex).toBe(fromTree);
    expect(doc.activeNode).toBe(fromTree);
  });

  it("should add a new node to a child node", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });
    doc.addNode({
      children: new Map(),
      id: "2",
      parentId: "1",
      x: 0,
      y: 0,
    });
  });

  it("should delete a node and its children", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });
    doc.addNode({
      children: new Map(),
      id: "2",
      parentId: "1",
      x: 0,
      y: 0,
    });
    doc.addNode({
      children: new Map(),
      id: "4",
      parentId: "2",
      x: 0,
      y: 0,
    });
    doc.selectNode("1");
    doc.addNode({
      children: new Map(),
      id: "3",
      parentId: "1",
      x: 0,
      y: 0,
    });
    doc.selectNode("1");
    doc.deleteNode("1");
    expect(doc.children.size).toEqual(0);
    expect(doc.nodeReferences.size).toEqual(0);
    expect(doc.activeNode).toEqual(doc);
    expect(doc.nodeReferences.get("2")).toBeUndefined();
    expect(doc.nodeReferences.get("3")).toBeUndefined();
    expect(doc.nodeReferences.get("4")).toBeUndefined();
  });

  it("should prevent adding a node to a non-existent parent", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });

    doc.deleteNode("1");

    expect(() => {
      doc.addNode({
        children: new Map(),
        id: "2",
        parentId: "1",
        x: 0,
        y: 0,
      });
    }).toThrow("Parent node not found");
  });

  it("should prevent adding a node to a node that is not a child of the active node", () => {
    const doc = new DocumentModel({ name: "Test Document" });
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });
    doc.selectNode("root");
    expect(() => {
      doc.addNode({
        children: new Map(),
        id: "2",
        parentId: "1",
        x: 0,
        y: 0,
      });
    }).toThrow("Node is not a child of the active node");
  });

  it("should save a flat document without nested children or nodeReferences", () => {
    const doc = new DocumentModel({ name: "Board" });
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });
    doc.addNode({
      children: new Map(),
      id: "2",
      parentId: "1",
      x: 10,
      y: 10,
    });

    const saved = doc.save();

    expect(saved.metadata).toEqual({ name: "Board" });
    expect(saved.activeNodeId).toBe("2");
    expect(saved.nodes).toEqual(
      expect.arrayContaining([
        { id: "1", parentId: "root", x: 0, y: 0 },
        { id: "2", parentId: "1", x: 10, y: 10 },
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
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });
    doc.addNode({
      children: new Map(),
      id: "2",
      parentId: "1",
      x: 10,
      y: 10,
    });
    doc.selectNode("1");

    const loaded = DocumentModel.load(doc.save());

    expect(loaded.metadata.name).toBe("Board");
    expect(loaded.activeNode).toBe(loaded.nodeReferences.get("1"));
    expect(loaded.children.get("1")).toBe(loaded.nodeReferences.get("1"));
    expect(loaded.children.get("1")?.children.get("2")).toBe(loaded.nodeReferences.get("2"));
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
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });
    const before = doc.nodeReferences.get("1");

    const updated = doc.updateNode({ x: 50, y: 25 });

    expect(updated.x).toBe(50);
    expect(updated.y).toBe(25);
    expect(updated).toBe(before);
    expect(doc.children.get("1")).toBe(updated);
    expect(doc.nodeReferences.get("1")).toBe(updated);
  });

  it("should not change a child's local coords when the parent is updated", () => {
    const doc = new DocumentModel({ name: "Board" });
    doc.addNode({
      children: new Map(),
      id: "1",
      parentId: "root",
      x: 0,
      y: 0,
    });
    doc.addNode({
      children: new Map(),
      id: "2",
      parentId: "1",
      x: 10,
      y: 10,
    });
    doc.selectNode("1");
    doc.updateNode({ x: 100, y: 200 });

    const child = doc.nodeReferences.get("2");
    expect(child?.x).toBe(10);
    expect(child?.y).toBe(10);
  });

  it("should prevent updating the root", () => {
    const doc = new DocumentModel({ name: "Board" });
    expect(() => doc.updateNode({ x: 1 })).toThrow("Root node cannot be updated");
  });
});
