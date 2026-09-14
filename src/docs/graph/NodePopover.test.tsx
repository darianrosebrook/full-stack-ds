import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { GraphRenderNode } from "./docsGraphAdapter";
import { NodePopover } from "./NodePopover";

const NODE: GraphRenderNode = {
  id: "abc123",
  route: "/docs/architecture/overview",
  title: "Overview",
  relPath: "docs/architecture/overview.md",
  section: "architecture",
  authority: "architecture",
  status: "active",
  updated: "2026-09-01",
  degree: 4,
  radius: 10,
  category: "architecture",
  x: 0,
  y: 0,
  fx: null,
  fy: null,
  vx: 0,
  vy: 0,
};

describe("NodePopover", () => {
  it("renders the node's identity and frontmatter metadata", () => {
    render(<NodePopover node={NODE} onOpen={() => {}} onDismiss={() => {}} />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("docs/architecture/overview.md")).toBeInTheDocument();
    expect(screen.getByText("architecture")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("navigates through onOpen with the node's route", () => {
    const onOpen = vi.fn();
    render(<NodePopover node={NODE} onOpen={onOpen} onDismiss={() => {}} />);
    fireEvent.click(screen.getByRole("link", { name: "Open" }));
    expect(onOpen).toHaveBeenCalledWith("/docs/architecture/overview");
  });

  it("dismisses on Escape", () => {
    const onDismiss = vi.fn();
    render(<NodePopover node={NODE} onOpen={() => {}} onDismiss={onDismiss} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("dismisses on pointer-down outside the popover, not inside", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <NodePopover node={NODE} onOpen={() => {}} onDismiss={onDismiss} />
    );
    fireEvent.pointerDown(container.firstElementChild as HTMLElement);
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.pointerDown(document.body);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
