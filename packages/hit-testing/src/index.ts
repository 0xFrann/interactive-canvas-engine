import type { Document, Node } from "@canvas-engine/document";
import type { WorldPoint } from "./types";

export interface HitTestOptions {
  ignoreSubtreeOf?: Node["id"];
}

export function containsPoint(node: Node, point: WorldPoint): boolean {
  return (
    point.x >= node.worldX &&
    point.x <= node.worldX + node.width &&
    point.y >= node.worldY &&
    point.y <= node.worldY + node.height
  );
}

function isInSubtree(doc: Document, rootId: Node["id"], nodeId: Node["id"]): boolean {
  if (nodeId === rootId) {
    return true;
  }
  let current = doc.nodeReferences.get(nodeId);
  while (current) {
    if (current.parentId === rootId) {
      return true;
    }
    if (current.parentId === doc.id) {
      return false;
    }
    current = doc.nodeReferences.get(current.parentId);
  }
  return false;
}

export function hitTest(
  doc: Document,
  point: WorldPoint,
  options: HitTestOptions = {},
): Node["id"] | undefined {
  let hit: Node["id"] | undefined;
  for (const node of doc.nodeReferences.values()) {
    if (options.ignoreSubtreeOf && isInSubtree(doc, options.ignoreSubtreeOf, node.id)) {
      continue;
    }
    if (containsPoint(node, point)) {
      hit = node.id;
    }
  }
  return hit;
}

export function resolveDropParent(
  doc: Document,
  draggedId: Node["id"],
  cursor: WorldPoint,
): Node["id"] | Document["id"] | undefined {
  const dragged = doc.nodeReferences.get(draggedId);
  if (!dragged) {
    return undefined;
  }

  const underCursor = hitTest(doc, cursor, { ignoreSubtreeOf: draggedId });
  if (underCursor && underCursor !== dragged.parentId) {
    return underCursor;
  }

  if (dragged.parentId !== doc.id) {
    const parent = doc.nodeReferences.get(dragged.parentId);
    if (parent && !containsPoint(parent, cursor)) {
      return doc.id;
    }
  }

  return undefined;
}

export type { WorldPoint } from "./types";
