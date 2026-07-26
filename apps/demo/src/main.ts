import { createCamera, panCamera, screenToWorld, zoomCameraAt } from "@canvas-engine/camera";
import { DocumentModel } from "@canvas-engine/document";
import { hitTest, resolveDropParent } from "@canvas-engine/hit-testing";
import { renderDocument } from "@canvas-engine/renderer";
import { createFrameLoop } from "@canvas-engine/runtime";
import "./style.css";

const canvasEl = document.querySelector<HTMLCanvasElement>("#board");
const hudBoardActiveEl = document.querySelector<HTMLParagraphElement>("#hud-board-active");
const hudBoardNodesEl = document.querySelector<HTMLParagraphElement>("#hud-board-nodes");
const hudViewEl = document.querySelector<HTMLParagraphElement>("#hud-view");
const hudDisplayEl = document.querySelector<HTMLParagraphElement>("#hud-display");
const hudGestureEl = document.querySelector<HTMLParagraphElement>("#hud-gesture");
const hudBrowserEl = document.querySelector<HTMLParagraphElement>("#hud-browser");
const hudSavedEl = document.querySelector<HTMLParagraphElement>("#hud-saved");
const btnAddRoot = document.querySelector<HTMLButtonElement>("#btn-add-root");
const btnAddChild = document.querySelector<HTMLButtonElement>("#btn-add-child");
const btnMoveFrame = document.querySelector<HTMLButtonElement>("#btn-move-frame");
const btnBurst = document.querySelector<HTMLButtonElement>("#btn-burst");
const chkReduceMotion = document.querySelector<HTMLInputElement>("#chk-reduce-motion");

if (
  !canvasEl ||
  !hudBoardActiveEl ||
  !hudBoardNodesEl ||
  !hudViewEl ||
  !hudDisplayEl ||
  !hudGestureEl ||
  !hudBrowserEl ||
  !hudSavedEl ||
  !btnAddRoot ||
  !btnAddChild ||
  !btnMoveFrame ||
  !btnBurst ||
  !chkReduceMotion
) {
  throw new Error("Demo DOM missing expected elements");
}

const canvas = canvasEl;
const hudBoardActive = hudBoardActiveEl;
const hudBoardNodes = hudBoardNodesEl;
const hudView = hudViewEl;
const hudDisplay = hudDisplayEl;
const hudGesture = hudGestureEl;
const hudBrowser = hudBrowserEl;
const hudSaved = hudSavedEl;
const maybeCtx = canvas.getContext("2d");
if (!maybeCtx) {
  throw new Error("2D canvas context unavailable");
}
const ctx: CanvasRenderingContext2D = maybeCtx;

const doc = new DocumentModel({ name: "Demo board" });
const camera = createCamera();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const loop = createFrameLoop({
  maxFps: prefersReducedMotion ? 30 : null,
});
chkReduceMotion.checked = prefersReducedMotion;

chkReduceMotion.addEventListener("change", () => {
  loop.setMaxFps(chkReduceMotion.checked ? 30 : null);
  loop.requestFrame();
});

const frame = doc.addNode({ height: 160, width: 220, x: 140, y: 100 });
doc.addNode({ height: 72, width: 100, x: 28, y: 28 });
doc.selectNode("root");
doc.addNode({ height: 80, width: 120, x: 420, y: 160 });
doc.selectNode(frame.id);

/** Rolling RAF deltas → estimate paint/display Hz (browsers rarely expose refresh rate). */
const frameDeltasMs: number[] = [];
let lastPaintTime = 0;
const FRAME_DELTA_SAMPLES = 45;

const notePaintClock = (time: number): void => {
  if (lastPaintTime > 0) {
    const delta = time - lastPaintTime;
    if (delta > 2 && delta < 120) {
      frameDeltasMs.push(delta);
      if (frameDeltasMs.length > FRAME_DELTA_SAMPLES) {
        frameDeltasMs.shift();
      }
    }
  }
  lastPaintTime = time;
};

const estimatedPaintHz = (): number | null => {
  if (frameDeltasMs.length < 8) {
    return null;
  }
  const sorted = [...frameDeltasMs].toSorted((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  return Math.round(1000 / median);
};

/**
 * Gesture stats:
 * - events = pointermove dispatches (engine input)
 * - samples = coalesced hardware polls (browser FYI)
 * - paints = our frame ticks that drew
 * Engine savings = events → paints. samples → events is the browser's job.
 */
const rates = {
  events: 0,
  paintDueToMove: false,
  paints: 0,
  samples: 0,
};

const savedPercent = (events: number, paints: number): string => {
  if (events <= 0) {
    return "—";
  }
  if (paints >= events) {
    return "0%";
  }
  const pct = Math.round((1 - paints / events) * 100);
  return `${pct}% (${events}→${paints})`;
};

const updateHud = (): void => {
  const hz = estimatedPaintHz();
  const cap = loop.maxFps;

  hudBoardActive.textContent = `active: ${doc.activeNodeId}`;
  hudBoardNodes.textContent = `nodes: ${doc.nodeReferences.size}`;
  hudView.textContent = `zoom: ${camera.zoom.toFixed(2)} · pan: ${Math.round(camera.x)}, ${Math.round(camera.y)}`;

  if (hz === null) {
    hudDisplay.textContent = "paint clock: measuring…";
  } else if (cap === null) {
    hudDisplay.textContent = `≈ ${hz} Hz display (estimated) · cap: off`;
  } else {
    hudDisplay.textContent = `≈ ${hz} Hz paint clock · cap: ${cap} FPS (reduced motion)`;
  }

  hudGesture.textContent = `events: ${rates.events} · paints: ${rates.paints}`;
  hudBrowser.textContent =
    rates.samples <= rates.events
      ? `browser samples: ${rates.samples}`
      : `browser samples: ${rates.samples} → ${rates.events} events`;
  hudSaved.textContent = `engine saved: ${savedPercent(rates.events, rates.paints)}`;
};

type PendingCommit =
  | { kind: "node"; nodeId: string; worldDx: number; worldDy: number }
  | { kind: "pan"; screenDx: number; screenDy: number };

let pendingCommit: PendingCommit | undefined;

const commitPendingInput = (): void => {
  if (!pendingCommit) {
    return;
  }

  if (pendingCommit.kind === "pan") {
    panCamera(camera, { x: pendingCommit.screenDx, y: pendingCommit.screenDy });
  } else {
    doc.selectNode(pendingCommit.nodeId);
    const node = doc.activeNode;
    if ("x" in node) {
      doc.updateNode({
        x: node.x + pendingCommit.worldDx,
        y: node.y + pendingCommit.worldDy,
      });
    }
  }
  pendingCommit = undefined;
};

loop.onBeforePaint(() => {
  commitPendingInput();
  doc.ensureWorld();
});

loop.onPaint((time) => {
  notePaintClock(time);
  if (rates.paintDueToMove) {
    rates.paints += 1;
    rates.paintDueToMove = false;
  }
  renderDocument(doc, ctx, {
    activeLineWidth: 3,
    activeStroke: "#fb923c",
    background: "#2a2620",
    camera,
    nodeFill: "#f0df9a",
    nodeStroke: "#b8952f",
  });
  updateHud();
});

const requestPaint = (): void => {
  loop.requestFrame();
};

const resetDragRates = (): void => {
  rates.events = 0;
  rates.samples = 0;
  rates.paints = 0;
  rates.paintDueToMove = false;
  updateHud();
};

const notePointerEvent = (): void => {
  rates.events += 1;
};

/** Raw coalesced length from the browser — count even if we ignore tiny deltas. */
const noteBrowserSamples = (count: number): void => {
  rates.samples += count;
};

const markPaintDue = (): void => {
  rates.paintDueToMove = true;
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

/** Prefer coalesced samples — browsers often dispatch one pointermove per frame. */
const pointerSamples = (event: PointerEvent): PointerEvent[] => {
  if (typeof event.getCoalescedEvents === "function") {
    const coalesced = event.getCoalescedEvents();
    if (coalesced.length > 0) {
      return coalesced;
    }
  }
  return [event];
};

const DRAG_THRESHOLD_PX = 4;
const BURST_UPDATES = 40;

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
    requestPaint();
  },
  { passive: false },
);

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 && event.button !== 1) {
    return;
  }

  resetDragRates();
  pendingCommit = undefined;
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
  requestPaint();
  canvas.style.cursor = "grabbing";
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!interaction) {
    return;
  }

  notePointerEvent();
  const samples = pointerSamples(event);
  noteBrowserSamples(samples.length);

  if (interaction.kind === "pan") {
    for (const sample of samples) {
      const screen = canvasPoint(sample);
      const dx = screen.x - interaction.lastScreen.x;
      const dy = screen.y - interaction.lastScreen.y;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX && !interaction.moved) {
        continue;
      }
      interaction.moved = true;
      markPaintDue();
      interaction.lastScreen = screen;
      if (!pendingCommit || pendingCommit.kind !== "pan") {
        pendingCommit = { kind: "pan", screenDx: 0, screenDy: 0 };
      }
      pendingCommit.screenDx += dx;
      pendingCommit.screenDy += dy;
    }
    if (interaction.moved) {
      requestPaint();
    }
    return;
  }

  const origin = interaction.originScreen;
  for (const sample of samples) {
    const screen = canvasPoint(sample);
    if (
      !interaction.moved &&
      Math.hypot(screen.x - origin.x, screen.y - origin.y) < DRAG_THRESHOLD_PX
    ) {
      continue;
    }
    interaction.moved = true;

    const world = screenToWorld(screen, camera);
    const dx = world.x - interaction.lastWorld.x;
    const dy = world.y - interaction.lastWorld.y;
    interaction.lastWorld = world;
    if (dx === 0 && dy === 0) {
      continue;
    }

    markPaintDue();
    if (!pendingCommit || pendingCommit.kind !== "node") {
      pendingCommit = { kind: "node", nodeId: interaction.nodeId, worldDx: 0, worldDy: 0 };
    }
    pendingCommit.worldDx += dx;
    pendingCommit.worldDy += dy;
  }

  if (interaction.moved && pendingCommit) {
    requestPaint();
  }
});

canvas.addEventListener("pointerup", (event) => {
  // Flush any samples that have not reached a frame yet before drop/hit logic.
  commitPendingInput();
  doc.ensureWorld();

  if (interaction?.kind === "pan" && !interaction.moved && event.button === 0) {
    doc.selectNode("root");
    requestPaint();
  }

  if (interaction?.kind === "node" && interaction.moved) {
    const cursor = screenToWorld(canvasPoint(event), camera);
    const nextParent = resolveDropParent(doc, interaction.nodeId, cursor);
    if (nextParent !== undefined) {
      doc.selectNode(interaction.nodeId);
      doc.reparentNode(nextParent);
      doc.selectNode(nextParent);
      requestPaint();
    } else {
      requestPaint();
    }
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
  requestPaint();
});

btnAddChild.addEventListener("click", () => {
  doc.addNode({ x: 24, y: 24 });
  requestPaint();
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
  requestPaint();
});

btnBurst.addEventListener("click", () => {
  if (doc.activeNodeId === "root") {
    return;
  }
  const node = doc.activeNode;
  if (!("x" in node)) {
    return;
  }

  resetDragRates();
  for (let i = 0; i < BURST_UPDATES; i += 1) {
    notePointerEvent();
    noteBrowserSamples(1);
    markPaintDue();
    doc.updateNode({ x: node.x + 1 });
    requestPaint();
  }
  // One RAF tick should absorb the burst: many events, few paints.
});

requestPaint();
