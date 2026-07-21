import type { Document, Node } from "@canvas-engine/document";
import type { WorldPoint } from "./types";

function contains(node: Node, point: WorldPoint): boolean {
  return (
    point.x >= node.worldX &&
    point.x <= node.worldX + node.width &&
    point.y >= node.worldY &&
    point.y <= node.worldY + node.height
  );
}

export function hitTest(doc: Document, point: WorldPoint): Node["id"] | undefined {
  let hit: Node["id"] | undefined;
  for (const node of doc.nodeReferences.values()) {
    if (contains(node, point)) {
      hit = node.id;
    }
  }
  return hit;
}

export type { WorldPoint } from "./types";
