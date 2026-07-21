import { DocumentModel } from "@canvas-engine/document";
import { renderDocument } from "@canvas-engine/renderer";
import "./style.css";

const canvasEl = document.querySelector<HTMLCanvasElement>("#board");
const hudActiveEl = document.querySelector<HTMLParagraphElement>("#hud-active");
const hudCountEl = document.querySelector<HTMLParagraphElement>("#hud-count");
const btnAddRoot = document.querySelector<HTMLButtonElement>("#btn-add-root");
const btnAddChild = document.querySelector<HTMLButtonElement>("#btn-add-child");
const btnMoveFrame = document.querySelector<HTMLButtonElement>("#btn-move-frame");

if (!canvasEl || !hudActiveEl || !hudCountEl || !btnAddRoot || !btnAddChild || !btnMoveFrame) {
  throw new Error("Demo DOM missing expected elements");
}

const canvas = canvasEl;
const hudActive = hudActiveEl;
const hudCount = hudCountEl;
const maybeCtx = canvas.getContext("2d");
if (!maybeCtx) {
  throw new Error("2D canvas context unavailable");
}
const ctx: CanvasRenderingContext2D = maybeCtx;

const doc = new DocumentModel({ name: "Demo board" });

const frame = doc.addNode({ height: 160, width: 220, x: 140, y: 100 });
doc.addNode({ height: 72, width: 100, x: 28, y: 28 });
doc.selectNode("root");
doc.addNode({ height: 80, width: 120, x: 420, y: 160 });
doc.selectNode(frame.id);

function paint(): void {
  renderDocument(doc, ctx, {
    activeLineWidth: 3,
    activeStroke: "#fb923c",
    background: "#2a2620",
    nodeFill: "#f0df9a",
    nodeStroke: "#b8952f",
  });
  hudActive.textContent = `active: ${doc.activeNodeId}`;
  hudCount.textContent = `nodes: ${doc.nodeReferences.size}`;
}

function canvasPoint(event: MouseEvent): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function hitTest(x: number, y: number): string | null {
  let hit: string | null = null;
  for (const node of doc.nodeReferences.values()) {
    const left = node.worldX;
    const top = node.worldY;
    if (x >= left && x <= left + node.width && y >= top && y <= top + node.height) {
      hit = node.id;
    }
  }
  return hit;
}

canvas.addEventListener("click", (event) => {
  const { x, y } = canvasPoint(event);
  const id = hitTest(x, y);
  if (id) {
    doc.selectNode(id);
  } else {
    doc.selectNode("root");
  }
  paint();
});

btnAddRoot.addEventListener("click", () => {
  doc.selectNode("root");
  doc.addNode({
    x: 80 + doc.nodeReferences.size * 24,
    y: 80 + (doc.nodeReferences.size % 5) * 20,
  });
  paint();
});

btnAddChild.addEventListener("click", () => {
  doc.addNode({ x: 24, y: 24 });
  paint();
});

btnMoveFrame.addEventListener("click", () => {
  if (doc.activeNodeId === "root") {
    return;
  }
  const node = doc.activeNode;
  if (!("x" in node)) {
    return;
  }
  doc.updateNode({ x: node.x + 40 });
  paint();
});

paint();
