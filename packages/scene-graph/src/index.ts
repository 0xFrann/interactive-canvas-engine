import type { Document, Node } from "@canvas-engine/document";
import type { WorldPosition } from "./types";

export function getWorldPosition(doc: Document, nodeId: Node["id"]): WorldPosition {
  let x = 0;
  let y = 0;
  let id: Node["id"] | Document["id"] = nodeId;

  while (id !== doc.id) {
    const node = doc.nodeReferences.get(id);
    if (!node) {
      throw new Error(`Node not found: ${id}`);
    }
    x += node.x;
    y += node.y;
    id = node.parentId;
  }

  return { x, y };
}

export type { WorldPosition } from "./types";
