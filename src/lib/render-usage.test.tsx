import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { bundle } from "../types/bundle";
import { UsageExamples } from "../views/sections/UsageExamples";

afterEach(cleanup);

function component(name: string) {
  const match = bundle.components.find((entry) => entry.name === name);
  if (!match) throw new Error(`missing component bundle: ${name}`);
  return match;
}

describe("usage sidecar render projection", () => {
  it("routes contract-declared named regions through the generated slots prop", () => {
    render(<UsageExamples component={component("Field")} />);

    expect(screen.getAllByText("Email address").length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
    expect(
      screen.getByText("We will only use this to send account notifications."),
    ).toBeTruthy();
  });

  it("preserves ordinary children when an authored region is also present", () => {
    render(<UsageExamples component={component("Chip")} />);

    expect(screen.getByText("TypeScript")).toBeTruthy();
  });

  it("renders explicit Status labels from the Status sidecar", () => {
    render(<UsageExamples component={component("Status")} />);

    expect(screen.getByText("Success")).toBeTruthy();
    expect(screen.getByText("Warning")).toBeTruthy();
  });

  it("renders Command item content inside its isolated portal canvas", async () => {
    render(<UsageExamples component={component("Command")} />);

    const item = await screen.findByText("Go to Dashboard");
    expect(item.closest("[data-fsds-preview-portal]")).toBeTruthy();
    expect(screen.getByText("View your project overview")).toBeTruthy();
  });

  it.each(["Accordion", "Card", "Popover", "Table", "Tabs", "Tooltip"])(
    "renders %s through declared compound parts without a usage fallback",
    (name) => {
      const { container } = render(<UsageExamples component={component(name)} />);
      expect(container.textContent).not.toContain("[usage fallback]");
    },
  );

  it("preserves the native table content model in the curated example", () => {
    const { container } = render(<UsageExamples component={component("Table")} />);
    const table = container.querySelector("table");

    expect(table?.querySelectorAll(":scope > caption")).toHaveLength(1);
    expect(table?.querySelectorAll(":scope > thead > tr > th")).toHaveLength(3);
    expect(table?.querySelectorAll(":scope > tbody > tr")).toHaveLength(2);
    expect(table?.querySelectorAll(":scope > tfoot > tr > td")).toHaveLength(1);
    expect(table?.querySelector("tfoot td")?.getAttribute("colspan")).toBe("3");
  });

  it("renders stateful compound examples with their public trigger and panel APIs", () => {
    const accordion = render(<UsageExamples component={component("Accordion")} />);
    expect(screen.getAllByRole("button", { name: "What is a design system?" })).toHaveLength(1);
    expect(
      screen.getAllByRole("region").some((region) =>
        region.textContent?.includes("A design system is a collection"),
      ),
    ).toBe(true);
    accordion.unmount();

    render(<UsageExamples component={component("Tabs")} />);
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    expect(screen.getAllByRole("tabpanel").length).toBeGreaterThan(0);
  });

  it.each(bundle.components.map((entry) => entry.name))(
    "renders every curated %s example without a delivery fallback",
    (name) => {
      render(<UsageExamples component={component(name)} />);
      expect(document.body.textContent).not.toContain("[usage fallback]");
    },
  );

  it("realizes contract-declared glyph and indicator components", async () => {
    const accordion = render(<UsageExamples component={component("Accordion")} />);
    expect(accordion.container.querySelector('[data-fsds-icon="chevron-down"]')).toBeTruthy();
    accordion.unmount();

    const details = render(<UsageExamples component={component("Details")} />);
    expect(details.container.querySelector('[data-fsds-icon="chevron-down"]')).toBeTruthy();
    details.unmount();

    render(<UsageExamples component={component("Command")} />);
    expect(await screen.findByText("Go to Dashboard")).toBeTruthy();
    expect(document.body.querySelector('[data-fsds-icon="search"]')).toBeTruthy();

    render(<UsageExamples component={component("Button")} />);
    expect(document.body.querySelector('[data-fsds-component="spinner"]')).toBeTruthy();
  });

});
