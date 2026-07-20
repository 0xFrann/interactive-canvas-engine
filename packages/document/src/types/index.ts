interface Node {
  id: string;
  x: number;
  y: number;
  children: Map<Node["id"], Node>;
  parentId: Node["id"];
}

interface Document {
  readonly id: string;
  readonly metadata: {
    name: string;
  };
  readonly children: Node["children"];
  readonly nodeReferences: Node["children"];
  readonly activeNode: Node | Document | null;
}

export { type Node, type Document };
