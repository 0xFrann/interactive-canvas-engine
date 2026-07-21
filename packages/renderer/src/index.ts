import type { Document } from "@canvas-engine/document";
import { getWorldPosition } from "@canvas-engine/scene-graph";

const DEFAULT_RENDER_OPTIONS = {
  activeLineWidth: 3,
  activeStroke: "#f97316",
  nodeFill: "#f5e6a8",
  nodeStroke: "#c4a84b",
};

export interface RenderOptions {
  background?: string;
  nodeFill?: string;
  nodeStroke?: string;
  activeStroke?: string;
  activeLineWidth?: number;
}

export function renderDocument(
  doc: Document,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions = {},
): void {
  const { canvas } = ctx;
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);
  if (options.background) {
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, width, height);
  }

  const fill = options.nodeFill ?? DEFAULT_RENDER_OPTIONS.nodeFill;
  const stroke = options.nodeStroke ?? DEFAULT_RENDER_OPTIONS.nodeStroke;
  const activeStroke = options.activeStroke ?? DEFAULT_RENDER_OPTIONS.activeStroke;
  const activeLineWidth = options.activeLineWidth ?? DEFAULT_RENDER_OPTIONS.activeLineWidth;
  const activeId = doc.activeNodeId === doc.id ? null : doc.activeNodeId;

  let active: { x: number; y: number; width: number; height: number } | null = null;

  for (const node of doc.nodeReferences.values()) {
    const { x, y } = getWorldPosition(doc, node.id);
    const isActive = node.id === activeId;

    ctx.fillStyle = fill;
    ctx.fillRect(x, y, node.width, node.height);

    if (isActive) {
      active = { height: node.height, width: node.width, x, y };
      continue;
    }

    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, node.width, node.height);
  }

  if (active) {
    ctx.strokeStyle = activeStroke;
    ctx.lineWidth = activeLineWidth;
    ctx.strokeRect(active.x, active.y, active.width, active.height);
  }
}

export { DEFAULT_NODE_HEIGHT, DEFAULT_NODE_WIDTH } from "./types";
