import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { TracePanel } from "../TracePanel";
import type { ComponentBundle } from "../../types/data";
import type { TraceSelection } from "../../trace/types";

// TRACE-PANEL-TABS-01 — the right-hand inspector is a two-tab surface
// (Properties default-selected, then Contract). The contract JSON tree and the
// trace-selection controls live inside the Contract tab; Properties is reserved
// but intentionally blank for this slice. These tests assert the rendered DOM
// against acceptance A1–A5, not against mocks: they query for the real tab
// roles, the real tree text, and drive a real click on Clear selection.

function makeComponent(): ComponentBundle {
  return {
    name: "Accordion",
    contractPath: "components/Accordion/Accordion.contract.json",
    contract: {
      name: "Accordion",
      layer: "composer",
      // A distinctive leaf so we can prove the JsonTreeViewer rendered the
      // contract inside the Contract panel (and only there).
      description: "ACCORDION_CONTRACT_MARKER",
    },
    sources: {},
    usage: [],
  };
}

function makeSelection(): TraceSelection {
  return {
    framework: "react",
    componentName: "Accordion",
    hit: {
      contractPath: "anatomy.dom.bindings.aria-expanded",
      explanation: "EXPLANATION_MARKER region exists because of this binding.",
      start: { line: 3, column: 2 },
      length: 12,
      kind: "binding",
    },
  };
}

describe("TracePanel two-tab inspector (TRACE-PANEL-TABS-01)", () => {
  it("A1: renders exactly two tabs — Properties then Contract — with Properties selected by default", () => {
    render(<TracePanel component={makeComponent()} selection={null} onClear={() => {}} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveTextContent("Properties");
    expect(tabs[1]).toHaveTextContent("Contract");

    // Default selection is Properties (per spec): aria-selected drives this.
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");

    // The old static "CONTRACT" heading is gone — the tab bar is the header.
    expect(screen.queryByRole("heading", { name: /^contract$/i })).toBeNull();
  });

  it("A3: the default (Properties) panel shows placeholder copy only — no contract tree", () => {
    render(<TracePanel component={makeComponent()} selection={null} onClear={() => {}} />);

    // The visible (non-hidden) tabpanel is Properties; it must not contain the
    // contract marker text from the tree.
    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel = panels.find((p) => !p.hasAttribute("hidden"));
    expect(visiblePanel).toBeTruthy();
    expect(visiblePanel!).toHaveTextContent(/properties will appear here/i);
    expect(visiblePanel!).not.toHaveTextContent("ACCORDION_CONTRACT_MARKER");
  });

  it("A2: activating the Contract tab reveals the contract JSON tree", async () => {
    const user = userEvent.setup();
    render(<TracePanel component={makeComponent()} selection={null} onClear={() => {}} />);

    await user.click(screen.getByRole("tab", { name: "Contract" }));

    // Now the Contract panel is the active (non-hidden) tabpanel and carries
    // the tree-rendered contract marker.
    const contractTab = screen.getByRole("tab", { name: "Contract" });
    expect(contractTab).toHaveAttribute("aria-selected", "true");

    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel = panels.find((p) => !p.hasAttribute("hidden"))!;
    expect(visiblePanel).toHaveTextContent("ACCORDION_CONTRACT_MARKER");
    // Placeholder/empty-selection hint also lives in the Contract panel.
    expect(visiblePanel).toHaveTextContent(/click any tagged region/i);
  });

  it("A4: with a selection, the Contract tab shows the trace chip/path and Clear selection invokes onClear", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <TracePanel component={makeComponent()} selection={makeSelection()} onClear={onClear} />,
    );

    await user.click(screen.getByRole("tab", { name: "Contract" }));

    const panels = screen.getAllByRole("tabpanel", { hidden: true });
    const visiblePanel = panels.find((p) => !p.hasAttribute("hidden"))!;
    // The selection chip (kind), explanation, and contract path are rendered.
    expect(visiblePanel).toHaveTextContent("binding");
    expect(visiblePanel).toHaveTextContent("EXPLANATION_MARKER");
    expect(visiblePanel).toHaveTextContent("anatomy.dom.bindings.aria-expanded");

    const clearBtn = within(visiblePanel).getByRole("button", { name: /clear selection/i });
    await user.click(clearBtn);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("A5: with no component, renders the empty-state message and no tabs", () => {
    render(<TracePanel component={null} selection={null} onClear={() => {}} />);

    expect(screen.getByText(/select a component to inspect its contract/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("tab")).toHaveLength(0);
  });

  it("has no axe violations in the default rendered state", async () => {
    const { container } = render(
      <TracePanel component={makeComponent()} selection={null} onClear={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
