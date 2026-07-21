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
});
