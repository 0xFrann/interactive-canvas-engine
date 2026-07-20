import type { Document, Node } from "./types";

class DocumentModel implements Document {
  readonly id: Document["id"] = "root";
  readonly metadata: Document["metadata"];
  readonly children: Document["children"];
  readonly nodeReferences: Document["nodeReferences"];
  activeNode: Document["activeNode"];

  constructor(metadata: Document["metadata"]) {
    this.metadata = metadata;
    this.children = new Map();
    this.nodeReferences = new Map();
    this.activeNode = this;
  }

  private createNode(node: Node, parentNode: Node | Document): Node {
    if (node.id === "root") {
      throw new Error("Root node cannot be overridden");
    }

    // Same object in tree + index + activeNode (not a copy).
    parentNode.children.set(node.id, node);
    this.nodeReferences.set(node.id, node);
    this.activeNode = node;
    return node;
  }

  addNode(node: Node) {
    if (!this.activeNode) {
      throw new Error("No active node");
    }

    const parentNode = (() => {
      try {
        return this.getNode(node.parentId);
      } catch {
        throw new Error("Parent node not found");
      }
    })();

    if (this.activeNode !== parentNode) {
      throw new Error("Node is not a child of the active node");
    }

    return this.createNode(node, parentNode);
  }

  selectNode(id: Node["id"]): void {
    this.activeNode = this.getNode(id);
  }

  private getNode(id: Node["id"]): Node | DocumentModel {
    if (!id) {
      throw new Error("Node id is required");
    }

    if (id === "root") {
      return this;
    }

    const node = this.nodeReferences.get(id);
    if (!node) {
      throw new Error("Node not found");
    }
    return node;
  }

  deleteNode(id: Node["id"]): void {
    if (!this.activeNode) {
      throw new Error("No active node");
    }

    if (this.activeNode.id !== id) {
      throw new Error("Active node is not the node to delete");
    }

    if (this.activeNode === this) {
      throw new Error("Root node cannot be deleted");
    }

    const parentNode = this.getNode((this.activeNode as Node).parentId);
    parentNode.children.delete(this.activeNode.id);
    this.nodeReferences.delete(this.activeNode.id);
    this.activeNode = parentNode;
  }
}

export { DocumentModel };
