interface Node {
  id: string;
  x: number;
  y: number;
  children: Map<Node["id"], Node>;
  parentId: Node["id"];
}

/** Local position patch — does not include id, parentId, or children. */
type NodeUpdate = Partial<Pick<Node, "x" | "y">>;

interface Document {
  readonly id: string;
  readonly metadata: {
    name: string;
  };
  readonly children: Node["children"];
  readonly nodeReferences: Node["children"];
  readonly activeNode: Node | Document | null;
}

interface SerializedNode {
  id: Node["id"];
  parentId: Node["id"];
  x: number;
  y: number;
}

interface SerializedDocument {
  metadata: Document["metadata"];
  nodes: SerializedNode[];
  activeNodeId: Node["id"] | Document["id"];
}

export { type Node, type NodeUpdate, type Document, type SerializedNode, type SerializedDocument };
