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

});
