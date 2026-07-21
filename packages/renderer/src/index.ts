import type { Document } from "@canvas-engine/document";
import { getWorldPosition } from "@canvas-engine/scene-graph";
import { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./types";

export interface RenderOptions {
  /** Fill behind nodes. Default: clear only. */
  background?: string;
  nodeFill?: string;
  nodeStroke?: string;
  /** Stroke for `doc.activeNodeId` when it is a node (not root). */
  activeStroke?: string;
  activeLineWidth?: number;
}

/**
 * Paint every document node as a rect at its world position.
 * Size is hardcoded for now — real width/height land on Node next.
 * Active node (when not root) gets a stronger outline.
 */
export function renderDocument(
  doc: Document,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions = {},
): void {
  const { canvas } = ctx;
  const {width} = canvas;
  const {height} = canvas;

  ctx.clearRect(0, 0, width, height);
  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
  }

  const fill = options.nodeFill ?? "#f5e6a8";
  const stroke = options.nodeStroke ?? "#c4a84b";
  const activeStroke = options.activeStroke ?? "#f97316";
  const activeLineWidth = options.activeLineWidth ?? 3;
  const activeId = doc.activeNodeId === doc.id ? null : doc.activeNodeId;

  let activeNode: { x: number; y: number } | null = null;

  for (const node of doc.nodeReferences.values()) {
    const { x, y } = getWorldPosition(doc, node.id);
    const isActive = node.id === activeId;

    ctx.fillStyle = fill;
    ctx.fillRect(x, y, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);

    if (isActive) {
      activeNode = { x, y };
      continue;
    }

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);
  }

  // Draw active outline last so it stays visible when nodes overlap.
  if (activeNode) {
    ctx.strokeStyle = activeStroke;
    ctx.lineWidth = activeLineWidth;
    ctx.strokeRect(activeNode.x, activeNode.y, DEFAULT_NODE_WIDTH, DEFAULT_NODE_HEIGHT);
  }
}

export { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./types";
