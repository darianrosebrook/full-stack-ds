import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { useEffect, useRef, useState } from "react";

import type { GraphRenderModel, GraphRenderNode } from "./docsGraphAdapter";
import {
  fitTransform,
  pickNode,
  screenToWorld,
  wheelFactor,
  zoomAt,
  type Transform,
} from "./graphCanvasMath";
import { NodePopover } from "./NodePopover";

/**
 * Canvas 2D renderer for the docs dependency graph. The interaction model is
 * ported from Sterling's GraphViewer-in-static-config contract — live force
 * layout over deterministic seeds, pan, wheel zoom toward the cursor, node
 * dragging with pin-release, hover adjacency highlighting, click-to-popover
 * — re-hosted on canvas 2D sized for a corpus of tens of docs rather than
 * Sterling's thousands of history states.
 *
 * The heavy math lives in graphCanvasMath (pure, unit-tested); this file is
 * the effects-and-paint shell. When a 2D context is unavailable (jsdom, or a
 * browser with canvas disabled) the component reports that honestly instead
 * of rendering an empty rectangle.
 */

interface SimNode extends SimulationNodeDatum {
  id: string;
  radius: number;
}

interface MutableInteraction {
  transform: Transform;
  draggingNode: GraphRenderNode | null;
  panning: boolean;
  lastX: number;
  lastY: number;
  moved: number;
}

export interface ForceGraphCanvasProps {
  model: GraphRenderModel;
  palette: string[];
  onOpen: (route: string) => void;
}

const SIM_MIN_ALPHA = 0.02;
const CLICK_SLOP = 4;

export function ForceGraphCanvas({ model, palette, onOpen }: ForceGraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const interaction = useRef<MutableInteraction>({
    transform: { x: 0, y: 0, k: 1 },
    draggingNode: null,
    panning: false,
    lastX: 0,
    lastY: 0,
    moved: 0,
  });
  const [hover, setHover] = useState<{ node: GraphRenderNode; sx: number; sy: number } | null>(
    null
  );
  // The draw loop reads hover through a ref: the paint effect depends only on
  // the model, so React state alone would leave the closure permanently stale.
  const hoverRef = useRef<{ node: GraphRenderNode; sx: number; sy: number } | null>(null);
  const setHoverTracked = (next: { node: GraphRenderNode; sx: number; sy: number } | null) => {
    hoverRef.current = next;
    setHover(next);
  };
  const [selected, setSelected] = useState<{
    node: GraphRenderNode;
    sx: number;
    sy: number;
  } | null>(null);
  const [renderMode, setRenderMode] = useState<"pending" | "canvas" | "unavailable">(
    "pending"
  );

  const colorOf = (node: GraphRenderNode): string => {
    const index = model.categories.find((category) => category.key === node.category)?.index ?? 0;
    return palette[index % palette.length] ?? "#475569";
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (canvas === null || container === null) return;
    const context = canvas.getContext("2d");
    if (context === null) {
      setRenderMode("unavailable");
      return;
    }
    setRenderMode("canvas");

    const sim: Simulation<SimNode, SimulationLinkDatum<SimNode>> = forceSimulation(
      model.nodes as GraphRenderNode[] as SimNode[]
    )
      .force(
        "link",
        forceLink<SimNode, SimulationLinkDatum<SimNode>>(
          model.links.map((link) => ({ ...link })) as SimulationLinkDatum<SimNode>[]
        )
          .id((node) => node.id)
          .distance(64)
          .strength(0.08)
      )
      .force("charge", forceManyBody().strength(-160))
      .force("collide", forceCollide<SimNode>().radius((node) => node.radius + 3).iterations(2))
      .force("x", forceX(0).strength(0.05))
      .force("y", forceY(0).strength(0.05))
      .stop();
    const simLinks = sim.force("link") as unknown as {
      links(): SimulationLinkDatum<SimNode>[];
    };

    let alive = true;
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
    };
    resize();
    interaction.current.transform = fitTransform(model.nodes, width, height);
    const observer = new ResizeObserver(() => {
      resize();
    });
    observer.observe(container);

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const t = interaction.current.transform;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const hoveredId = hoverRef.current?.node.id ?? null;
      context.save();
      context.translate(t.x, t.y);
      context.scale(t.k, t.k);
      for (const link of simLinks.links()) {
        const source = link.source as unknown as SimNode;
        const target = link.target as unknown as SimNode;
        const active =
          hoveredId !== null &&
          (source.id === hoveredId || target.id === hoveredId);
        context.strokeStyle = active ? "rgba(71,85,105,0.85)" : "rgba(100,116,139,0.28)";
        context.lineWidth = (active ? 1.6 : 1) / t.k;
        context.beginPath();
        context.moveTo(source.x ?? 0, source.y ?? 0);
        context.lineTo(target.x ?? 0, target.y ?? 0);
        context.stroke();
      }
      for (const node of model.nodes) {
        const dimmed =
          hoveredId !== null &&
          node.id !== hoveredId &&
          !(model.neighbors.get(hoveredId)?.has(node.id) ?? false);
        context.globalAlpha = dimmed ? 0.15 : 1;
        context.fillStyle = colorOf(node);
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();
        if (node.id === hoveredId) {
          context.strokeStyle = "rgba(15,23,42,0.9)";
          context.lineWidth = 2 / t.k;
          context.beginPath();
          context.arc(node.x, node.y, node.radius + 2 / t.k, 0, Math.PI * 2);
          context.stroke();
        }
        context.globalAlpha = 1;
      }
      context.restore();

      // Labels in screen space so they stay legible at every zoom.
      if (t.k >= 0.9) {
        context.font = "11px ui-sans-serif, system-ui, sans-serif";
        context.textAlign = "center";
        context.fillStyle = "rgba(15,23,42,0.85)";
        for (const node of model.nodes) {
          const dimmed =
            hoveredId !== null &&
            node.id !== hoveredId &&
            !(model.neighbors.get(hoveredId)?.has(node.id) ?? false);
          if (dimmed) continue;
          const sx = t.x + node.x * t.k;
          const sy = t.y + node.y * t.k + node.radius * t.k + 12;
          if (sx < -50 || sx > width + 50 || sy < 0 || sy > height + 20) continue;
          const label = node.title.length > 26 ? `${node.title.slice(0, 25)}…` : node.title;
          context.fillText(label, sx, sy);
        }
      }
    };

    const tick = () => {
      if (!alive) return;
      if (sim.alpha() > SIM_MIN_ALPHA) sim.tick();
      draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const localPoint = (event: PointerEvent | WheelEvent | MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const worldPoint = (event: PointerEvent | WheelEvent | MouseEvent) => {
      const local = localPoint(event);
      return screenToWorld(local.x, local.y, interaction.current.transform);
    };

    const onPointerDown = (event: PointerEvent) => {
      const world = worldPoint(event);
      const node = pickNode(model.nodes, world.x, world.y);
      const local = localPoint(event);
      interaction.current.lastX = local.x;
      interaction.current.lastY = local.y;
      interaction.current.moved = 0;
      if (node !== null) {
        interaction.current.draggingNode = node;
        node.fx = node.x;
        node.fy = node.y;
      } else {
        interaction.current.panning = true;
      }
      canvas.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      const local = localPoint(event);
      const state = interaction.current;
      state.moved += Math.abs(local.x - state.lastX) + Math.abs(local.y - state.lastY);
      const world = screenToWorld(local.x, local.y, state.transform);
      if (state.draggingNode !== null) {
        state.draggingNode.fx = world.x;
        state.draggingNode.fy = world.y;
        sim.alpha(0.3);
      } else if (state.panning) {
        state.transform = {
          ...state.transform,
          x: state.transform.x + (local.x - state.lastX),
          y: state.transform.y + (local.y - state.lastY),
        };
      } else {
        const node = pickNode(model.nodes, world.x, world.y);
        setHoverTracked(node !== null ? { node, sx: local.x, sy: local.y } : null);
      }
      state.lastX = local.x;
      state.lastY = local.y;
    };
    const onPointerUp = (event: PointerEvent) => {
      const state = interaction.current;
      const local = localPoint(event);
      if (state.draggingNode !== null) {
        state.draggingNode.fx = null;
        state.draggingNode.fy = null;
        if (state.moved < CLICK_SLOP) {
          setSelected({ node: state.draggingNode, sx: local.x, sy: local.y });
        }
        state.draggingNode = null;
      } else if (state.panning) {
        if (state.moved < CLICK_SLOP) setSelected(null);
        state.panning = false;
      }
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const local = localPoint(event);
      interaction.current.transform = zoomAt(
        interaction.current.transform,
        local.x,
        local.y,
        wheelFactor(event.deltaY)
      );
    };
    const onDouble = () => {
      interaction.current.transform = fitTransform(model.nodes, width, height);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDouble);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      sim.stop();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDouble);
    };
    // The model is replaced wholesale (new fetch); hover/selected are view
    // state read through closures at draw time, not effect dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, palette]);

  return (
    <div ref={containerRef} className="docs-graph-canvas-container">
      {renderMode === "unavailable" ? (
        <p className="docs-graph-canvas-unavailable" role="status">
          Graph rendering needs a canvas 2D context; none is available in this environment.
        </p>
      ) : null}
      <canvas
        ref={canvasRef}
        className="docs-graph-canvas"
        role="application"
        aria-label="Documentation dependency graph. Pan by dragging, zoom with the wheel, and click a node to open it."
      />
      {hover !== null ? (
        <div
          className="docs-graph-hover-card"
          style={{ left: hover.sx + 12, top: hover.sy + 12 }}
          aria-hidden="true"
        >
          <span className="docs-graph-hover-card__title">{hover.node.title}</span>
          <span className="docs-graph-hover-card__path">{hover.node.relPath}</span>
        </div>
      ) : null}
      {selected !== null ? (
        <div
          className="docs-graph-popover-anchor"
          style={{ left: Math.max(8, selected.sx - 120), top: selected.sy + 12 }}
        >
          <NodePopover
            node={selected.node}
            onOpen={(route) => {
              setSelected(null);
              onOpen(route);
            }}
            onDismiss={() => setSelected(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
