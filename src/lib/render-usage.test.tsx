import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
    const { container } = render(<UsageExamples component={component("Status")} />);

    expect(screen.getByText("Success")).toBeTruthy();
    expect(screen.getByText("Warning")).toBeTruthy();
    expect(container.querySelector('[data-fsds-icon="check"] path')).toBeTruthy();
    expect(container.querySelector('[data-fsds-icon="triangle-alert"] path')).toBeTruthy();
  });

  it("materializes JSON dates and renders Calendar captions and day labels", () => {
    render(<UsageExamples component={component("Calendar")} />);

    expect(screen.getByText("September 2026")).toBeTruthy();
    expect(screen.getByRole("button", { name: "1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "14" })).toBeTruthy();
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
    "renders every curated %s example with content and portal confinement",
    async (name) => {
      const entry = component(name);
      const { container } = render(<UsageExamples component={entry} />);
      expect(document.body.textContent).not.toContain("[usage fallback]");

      const frames = container.querySelectorAll<HTMLElement>("[data-usage-preview]");
      expect(frames).toHaveLength(entry.usage.length);
      for (const frame of frames) {
        const hasText = Boolean(frame.textContent?.trim());
        const hasStructuralWitness = Boolean(frame.querySelector(
          "svg path, img[src], input, textarea, select, button, progress, [role='separator'], [role='progressbar'], [role='status'], [aria-busy='true'], [aria-hidden='true']",
        ));
        expect(
          hasText || hasStructuralWitness,
          `${frame.dataset.usagePreview} rendered no content witness`,
        ).toBe(true);
      }

      const slug = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      await waitFor(() => {
        const roots = document.body.querySelectorAll(`.${slug}`);
        expect(roots.length).toBeGreaterThanOrEqual(entry.usage.length);
        for (const root of roots) {
          expect(
            root.closest("[data-usage-preview]"),
            `${name} escaped its example preview boundary`,
          ).toBeTruthy();
        }
      });
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
