interface WorldPosition {
  x: number;
  y: number;
}

const DEFAULT_NODE_WIDTH = 120;
const DEFAULT_NODE_HEIGHT = 80;

interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  worldX: number;
  worldY: number;
  children: Map<Node["id"], Node>;
  parentId: Node["id"];
}

type NodeUpdate = Partial<Pick<Node, "x" | "y" | "width" | "height">>;

type NodeCreate = Pick<Node, "x" | "y"> & Partial<Pick<Node, "width" | "height">>;

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
  ensureWorld(): void;
  /** How many times a dirty root was flushed via ensureWorld (demo / teaching). */
  worldSyncCount: number;
  save(): SerializedDocument;
}

interface SerializedNode {
  id: Node["id"];
  parentId: Node["id"];
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SerializedDocument {
  metadata: Document["metadata"];
  nodes: SerializedNode[];
  activeNodeId: Node["id"] | Document["id"];
}

export {
  DEFAULT_NODE_WIDTH,
  DEFAULT_NODE_HEIGHT,
  type WorldPosition,
  type Node,
  type NodeUpdate,
  type NodeCreate,
  type Document,
  type SerializedNode,
  type SerializedDocument,
};
