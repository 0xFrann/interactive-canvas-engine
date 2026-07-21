interface WorldPosition {
  x: number;
  y: number;
}

interface Node {
  id: string;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  children: Map<Node["id"], Node>;
  parentId: Node["id"];
}

type NodeUpdate = Partial<Pick<Node, "x" | "y">>;

type NodeCreate = Pick<Node, "x" | "y">;

interface Document {
  readonly id: string;
  readonly metadata: {
    name: string;
  };
  readonly children: Node["children"];
  readonly nodeReferences: Node["children"];
  activeNodeId: Node["id"] | Document["id"];
  readonly activeNode: Node | Document;

  addNode(props: NodeCreate): Node;
  selectNode(id: Node["id"] | Document["id"]): void;
  updateNode(patch: NodeUpdate): Node;
  reparentNode(newParentId: Node["id"] | Document["id"]): Node;
  deleteNode(id: Node["id"]): void;
  save(): SerializedDocument;
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

export {
  type WorldPosition,
  type Node,
  type NodeUpdate,
  type NodeCreate,
  type Document,
  type SerializedNode,
  type SerializedDocument,
};
