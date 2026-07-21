import type { Document, Node, NodeCreate, NodeUpdate, SerializedDocument } from "./types";

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

  private createId(): string {
    return crypto.randomUUID();
  }

  private createNode(node: Node, parentNode: Node | Document): Node {
    if (node.id === "root") {
      throw new Error("Root node cannot be overridden");
    }
    if (this.nodeReferences.has(node.id)) {
      throw new Error(`Duplicate node id: ${node.id}`);
    }

    // Same object in tree + index + activeNode
    parentNode.children.set(node.id, node);
    this.nodeReferences.set(node.id, node);
    this.activeNode = node;
    return node;
  }

  addNode(props: NodeCreate): Node {
    if (!this.activeNode) {
      throw new Error("No active node");
    }

    const node: Node = {
      children: new Map(),
      id: this.createId(),
      parentId: this.activeNode.id,
      x: props.x,
      y: props.y,
    };

    return this.createNode(node, this.activeNode);
  }

  selectNode(id: Node["id"]): void {
    this.activeNode = this.getNode(id);
  }

  updateNode(patch: NodeUpdate): Node {
    if (!this.activeNode) {
      throw new Error("No active node");
    }

    if (this.activeNode === this) {
      throw new Error("Root node cannot be updated");
    }

    const node = this.activeNode as Node;
    if (patch.x !== undefined) {
      node.x = patch.x;
    }
    if (patch.y !== undefined) {
      node.y = patch.y;
    }
    return node;
  }

  /**
   * Move the active node (and its subtree) under a new parent.
   * Local x/y are unchanged; nodeReferences keeps the same object refs.
   */
  reparentNode(newParentId: Node["id"] | Document["id"]): Node {
    if (!this.activeNode) {
      throw new Error("No active node");
    }

    if (this.activeNode === this) {
      throw new Error("Root node cannot be reparented");
    }

    const node = this.activeNode as Node;
    const newParent = this.getNode(newParentId);

    if (node.parentId === newParent.id) {
      return node;
    }

    if (this.wouldCreateCycle(node, newParent)) {
      throw new Error("Cannot reparent a node under itself or its descendant");
    }

    const oldParent = this.getNode(node.parentId);
    oldParent.children.delete(node.id);
    node.parentId = newParent.id;
    newParent.children.set(node.id, node);
    return node;
  }

  /** True if newParent is the node or lies in its subtree (would cycle). */
  private wouldCreateCycle(node: Node, newParent: Node | DocumentModel): boolean {
    if (newParent === this) {
      return false;
    }

    let current: Node | DocumentModel = newParent;
    while (current !== this) {
      if (current === node) {
        return true;
      }
      current = this.getNode((current as Node).parentId);
    }
    return false;
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

  private clearSubtreeFromIndex(node: Node): void {
    for (const child of node.children.values()) {
      this.clearSubtreeFromIndex(child);
    }
    this.nodeReferences.delete(node.id);
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

    const deleted = this.activeNode as Node;
    const parentNode = this.getNode(deleted.parentId);

    this.clearSubtreeFromIndex(deleted);
    parentNode.children.delete(deleted.id);
    this.activeNode = parentNode;
  }

  save(): SerializedDocument {
    if (!this.activeNode) {
      throw new Error("No active node");
    }

    const nodes: SerializedDocument["nodes"] = [];
    for (const node of this.nodeReferences.values()) {
      nodes.push({
        id: node.id,
        parentId: node.parentId,
        x: node.x,
        y: node.y,
      });
    }

    return {
      activeNodeId: this.activeNode.id,
      metadata: { ...this.metadata },
      nodes,
    };
  }

  static load(data: SerializedDocument): DocumentModel {
    const doc = new DocumentModel({ ...data.metadata });

    for (const row of data.nodes) {
      if (row.id === "root") {
        throw new Error("Root node cannot be overridden");
      }
      if (doc.nodeReferences.has(row.id)) {
        throw new Error(`Duplicate node id: ${row.id}`);
      }

      const node: Node = {
        children: new Map(),
        id: row.id,
        parentId: row.parentId,
        x: row.x,
        y: row.y,
      };
      doc.nodeReferences.set(node.id, node);
    }

    for (const node of doc.nodeReferences.values()) {
      const parent = node.parentId === "root" ? doc : doc.nodeReferences.get(node.parentId);

      if (!parent) {
        throw new Error(`Parent node not found: ${node.parentId}`);
      }

      parent.children.set(node.id, node);
    }

    doc.activeNode = doc.getNode(data.activeNodeId);
    return doc;
  }
}

export { DocumentModel };
export type {
  SerializedDocument,
  SerializedNode,
  Node,
  NodeCreate,
  NodeUpdate,
  Document,
} from "./types";
