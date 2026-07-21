import { createCamera, panCamera, screenToWorld, zoomCameraAt } from "@canvas-engine/camera";
import { DocumentModel } from "@canvas-engine/document";
import { renderDocument } from "@canvas-engine/renderer";
import "./style.css";

const canvasEl = document.querySelector<HTMLCanvasElement>("#board");
const hudActiveEl = document.querySelector<HTMLParagraphElement>("#hud-active");
const hudCountEl = document.querySelector<HTMLParagraphElement>("#hud-count");
const hudCameraEl = document.querySelector<HTMLParagraphElement>("#hud-camera");
const btnAddRoot = document.querySelector<HTMLButtonElement>("#btn-add-root");
const btnAddChild = document.querySelector<HTMLButtonElement>("#btn-add-child");
const btnMoveFrame = document.querySelector<HTMLButtonElement>("#btn-move-frame");

if (
  !canvasEl ||
  !hudActiveEl ||
  !hudCountEl ||
  !hudCameraEl ||
  !btnAddRoot ||
  !btnAddChild ||
  !btnMoveFrame
) {
  throw new Error("Demo DOM missing expected elements");
}

const canvas = canvasEl;
const hudActive = hudActiveEl;
const hudCount = hudCountEl;
const hudCamera = hudCameraEl;
const maybeCtx = canvas.getContext("2d");
if (!maybeCtx) {
  throw new Error("2D canvas context unavailable");
}
const ctx: CanvasRenderingContext2D = maybeCtx;

const doc = new DocumentModel({ name: "Demo board" });
const camera = createCamera();

const frame = doc.addNode({ height: 160, width: 220, x: 140, y: 100 });
doc.addNode({ height: 72, width: 100, x: 28, y: 28 });
doc.selectNode("root");
doc.addNode({ height: 80, width: 120, x: 420, y: 160 });
doc.selectNode(frame.id);

const paint = (): void => {
  renderDocument(doc, ctx, {
    activeLineWidth: 3,
    activeStroke: "#fb923c",
    background: "#2a2620",
    camera,
    nodeFill: "#f0df9a",
    nodeStroke: "#b8952f",
  });
  hudActive.textContent = `active: ${doc.activeNodeId}`;
  hudCount.textContent = `nodes: ${doc.nodeReferences.size}`;
  hudCamera.textContent = `zoom: ${camera.zoom.toFixed(2)} · pan: ${Math.round(camera.x)}, ${Math.round(camera.y)}`;
};

const canvasPoint = (event: PointerEvent | MouseEvent | WheelEvent): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};

const hitTestWorld = (worldX: number, worldY: number): string | null => {
  let hit: string | null = null;
  for (const node of doc.nodeReferences.values()) {
    const left = node.worldX;
    const top = node.worldY;
    if (
      worldX >= left &&
      worldX <= left + node.width &&
      worldY >= top &&
      worldY <= top + node.height
    ) {
      hit = node.id;
    }
  }
  return hit;
};

const PAN_THRESHOLD_PX = 4;
let panning = false;
let panMoved = false;
let panLast = { x: 0, y: 0 };
let pendingSelect: string | null = null;

canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    const screen = canvasPoint(event);
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    zoomCameraAt(camera, screen, factor);
    paint();
  },
  { passive: false },
);

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.button !== 1) {
    return;
  }

  const screen = canvasPoint(event);
  const world = screenToWorld(screen, camera);
  const hit = hitTestWorld(world.x, world.y);

  if (event.button === 1 || !hit) {
    panning = true;
    panMoved = false;
    panLast = screen;
    pendingSelect = null;
    canvas.setPointerCapture(event.pointerId);
    return;
  }

  pendingSelect = hit;
  panMoved = false;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!panning && pendingSelect === null) {
    return;
  }

  const screen = canvasPoint(event);
  const dx = screen.x - panLast.x;
  const dy = screen.y - panLast.y;

  if (panning) {
    if (Math.hypot(dx, dy) >= PAN_THRESHOLD_PX || panMoved) {
      panMoved = true;
      panCamera(camera, { x: dx, y: dy });
      panLast = screen;
      paint();
    }
    return;
  }

  // Started on a node: if dragged, switch to pan instead of select.
  if (pendingSelect && Math.hypot(dx, dy) >= PAN_THRESHOLD_PX) {
    panning = true;
    panMoved = true;
    pendingSelect = null;
    panLast = screen;
  }
});

canvas.addEventListener("pointerup", (event) => {
  if (pendingSelect && !panMoved) {
    doc.selectNode(pendingSelect);
    paint();
  } else if (!panMoved && !pendingSelect && event.button === 0) {
    doc.selectNode("root");
    paint();
  }

  panning = false;
  panMoved = false;
  pendingSelect = null;
  if (canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
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
