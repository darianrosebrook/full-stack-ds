// The plugin UI shell: model-driven render, message plumbing, filters,
// error/report surfaces, and outbound postMessage actions.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/svelte";
import { tick } from "svelte";
import FigmaPluginApp from "./FigmaPluginApp.svelte";
import type { ComponentSummary, FigmaUiModel } from "./ui-model.js";

function makeSummary(
  name: string,
  overrides: Partial<ComponentSummary> = {},
): ComponentSummary {
  return {
    name,
    cssPrefix: name.toLowerCase(),
    rootElement: "div",
    effectiveRole: null,
    propCount: 2,
    requiredPropCount: 1,
    anatomyCount: 1,
    variantAxes: [{ name: "Size", values: ["sm", "lg"] }],
    variantCellCount: 2,
    cssBlockCount: 1,
    hasBaseCssBlock: true,
    materializationStatus: "component_set_materialized",
    audit: [],
    descriptor: {
      schemaVersion: 1,
      component: { name, cssPrefix: name.toLowerCase() },
      anatomy: [],
      props: [],
      variants: {},
    },
    ...overrides,
  };
}

function makeModel(): FigmaUiModel {
  return {
    generatedAt: "2026-09-01T00:00:00.000Z",
    componentCount: 2,
    componentSetCount: 1,
    placeholderCount: 1,
    blockedCount: 1,
    summaries: [
      makeSummary("Button"),
      makeSummary("Dialog", {
        materializationStatus: "deferred" as ComponentSummary["materializationStatus"],
        audit: [{ severity: "blocked", label: "portal", detail: "portals unsupported" }],
      }),
    ],
  };
}

function sendInit(model: FigmaUiModel): void {
  window.dispatchEvent(
    new MessageEvent("message", {
      data: { pluginMessage: { type: "fsds:init", model } },
    }),
  );
}

async function sendInitAndFlush(model: FigmaUiModel): Promise<void> {
  sendInit(model);
  await tick();
}

const postMessage = vi.spyOn(window, "postMessage");

beforeEach(() => {
  postMessage.mockClear();
});

afterEach(cleanup);

describe("FigmaPluginApp — model rendering", () => {
  it("renders the loading placeholder before the init message", () => {
    const { container } = render(FigmaPluginApp);
    expect(container.textContent).toContain("Loading descriptors");
  });

  it("renders the summary list and metrics after init", async () => {
    const { container } = render(FigmaPluginApp);
    await sendInitAndFlush(makeModel());
    expect(container.textContent).toContain("Button");
    expect(container.textContent).toContain("Dialog");
    expect(container.querySelector('input[placeholder="Filter components"]')).toBeTruthy();
  });

  it("filters summaries by name or prefix", async () => {
    const { getByPlaceholderText, queryByRole } = render(FigmaPluginApp);
    await sendInitAndFlush(makeModel());
    await fireEvent.input(getByPlaceholderText("Filter components"), {
      target: { value: "dia" },
    });
    expect(queryByRole("button", { name: /^Dialog/ })).toBeTruthy();
    expect(queryByRole("button", { name: /^Button/ })).toBeNull();
  });

  it("shows the error notice for fsds:error messages", async () => {
    const { findByRole } = render(FigmaPluginApp);
    await sendInitAndFlush(makeModel());
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { pluginMessage: { type: "fsds:error", message: "boom" } },
      }),
    );
    expect((await findByRole("alert")).textContent).toContain("boom");
  });

  it("renders the materialization report after fsds:materialization-complete", async () => {
    const { container } = render(FigmaPluginApp);
    await sendInitAndFlush(makeModel());
    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          pluginMessage: {
            type: "fsds:materialization-complete",
            report: {
              scope: "allowlist",
              materialized: ["Button"],
              placeholders: ["Dialog"],
              skipped: [],
            },
          },
        },
      }),
    );
    await tick();
    expect(container.textContent).toContain("Dialog");
  });
});

describe("FigmaPluginApp — outbound messages", () => {
  it("posts a resize message on mount", async () => {
    render(FigmaPluginApp);
    await Promise.resolve();
    const calls = postMessage.mock.calls.map((c) => c[1] === "*" ? c[0] : c[0]);
    expect(
      calls.some(
        (msg) =>
          (msg as { pluginMessage: { type: string } })?.pluginMessage?.type === "fsds:resize",
      ),
    ).toBe(true);
  });

  it("posts fsds:materialize with allowlist scope from the header button", async () => {
    const { container } = render(FigmaPluginApp);
    sendInit(makeModel());
    await Promise.resolve();
    const button = Array.from(container.querySelectorAll("button")).find(
      (b) => b.textContent?.toLowerCase().includes("materializ") || b.textContent?.toLowerCase().includes("allowlist"),
    );
    expect(button).toBeTruthy();
    postMessage.mockClear();
    await fireEvent.click(button as HTMLElement);
    expect(
      postMessage.mock.calls.some(
        (c) =>
          (c[0] as { pluginMessage: { type: string } })?.pluginMessage?.type ===
            "fsds:materialize" &&
          (c[0] as { pluginMessage: { scope: string } })?.pluginMessage?.scope ===
            "allowlist",
      ),
    ).toBe(true);
  });
});
