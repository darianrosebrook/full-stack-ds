import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Anatomy } from "./Anatomy";
import type { ComponentContract } from "../../types/data";

describe("Anatomy typed-details evidence", () => {
  it("renders per-part description from the typed details map", () => {
    const contract: ComponentContract = {
      name: "Test",
      layer: "primitive",
      anatomy: {
        parts: ["root", "label"],
        details: {
          root: { description: "Root element wraps everything." },
          label: { description: "Visible text label." },
        },
      },
    };

    const { container } = render(<Anatomy contract={contract} />);
    console.log("\n=== anatomy key rendered HTML ===");
    const key = container.querySelector(".anatomy-key");
    console.log(key?.innerHTML);

    // Both descriptions appear; the fallback string does not.
    expect(screen.getByText("Root element wraps everything.")).toBeInTheDocument();
    expect(screen.getByText("Visible text label.")).toBeInTheDocument();
    expect(screen.queryByText("Anatomy part declared by the contract.")).toBeNull();
  });

  it("falls back to default string when details is absent", () => {
    const contract: ComponentContract = {
      name: "Test",
      layer: "primitive",
      anatomy: { parts: ["root"] },
    };
    const { container } = render(<Anatomy contract={contract} />);
    console.log("\n=== anatomy fallback path ===");
    console.log(container.querySelector(".anatomy-key")?.innerHTML);
    // Two parts get the same fallback — text content appears once per part.
    expect(screen.getAllByText("Anatomy part declared by the contract.").length).toBeGreaterThan(0);
  });

  it("falls back gracefully when a part has no description entry", () => {
    const contract: ComponentContract = {
      name: "Test",
      layer: "primitive",
      anatomy: {
        parts: ["root", "label"],
        // Note: details only covers `root`; `label` should fall back.
        details: {
          root: { description: "Only the root is documented." },
        },
      },
    };
    const { container } = render(<Anatomy contract={contract} />);
    console.log("\n=== anatomy partial-details path ===");
    console.log(container.querySelector(".anatomy-key")?.innerHTML);
    expect(screen.getByText("Only the root is documented.")).toBeInTheDocument();
    expect(screen.getByText("Anatomy part declared by the contract.")).toBeInTheDocument();
  });
});
