import { createCamera, panCamera, screenToWorld, zoomCameraAt } from "@canvas-engine/camera";
import { DocumentModel } from "@canvas-engine/document";
import { hitTest } from "@canvas-engine/hit-testing";
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

const DRAG_THRESHOLD_PX = 4;

type Interaction =
  | { kind: "pan"; lastScreen: { x: number; y: number }; moved: boolean }
  | {
      kind: "node";
      nodeId: string;
      lastWorld: { x: number; y: number };
      originScreen: { x: number; y: number };
      moved: boolean;
    };

let interaction: Interaction | undefined;

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
  const hit = hitTest(doc, world);

  if (event.button === 1 || !hit) {
    interaction = { kind: "pan", lastScreen: screen, moved: false };
    canvas.style.cursor = "grabbing";
    canvas.setPointerCapture(event.pointerId);
    return;
  }

  doc.selectNode(hit);
  interaction = {
    kind: "node",
    lastWorld: world,
    moved: false,
    nodeId: hit,
    originScreen: screen,
  };
  paint();
  canvas.style.cursor = "grabbing";
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!interaction) {
    return;
  }

  const screen = canvasPoint(event);

  if (interaction.kind === "pan") {
    const dx = screen.x - interaction.lastScreen.x;
    const dy = screen.y - interaction.lastScreen.y;
    if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX || interaction.moved) {
      interaction.moved = true;
      panCamera(camera, { x: dx, y: dy });
      interaction.lastScreen = screen;
      paint();
    }
    return;
  }

  const screenDx = screen.x - interaction.originScreen.x;
  const screenDy = screen.y - interaction.originScreen.y;
  if (!interaction.moved && Math.hypot(screenDx, screenDy) < DRAG_THRESHOLD_PX) {
    return;
  }
  interaction.moved = true;

  const world = screenToWorld(screen, camera);
  const dx = world.x - interaction.lastWorld.x;
  const dy = world.y - interaction.lastWorld.y;
  if (dx === 0 && dy === 0) {
    return;
  }

  doc.selectNode(interaction.nodeId);
  const node = doc.activeNode;
  if (!("x" in node)) {
    return;
  }
  doc.updateNode({ x: node.x + dx, y: node.y + dy });
  interaction.lastWorld = world;
  paint();
});

canvas.addEventListener("pointerup", (event) => {
  if (interaction?.kind === "pan" && !interaction.moved && event.button === 0) {
    doc.selectNode("root");
    paint();
  }

  interaction = undefined;
  canvas.style.cursor = "crosshair";
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
