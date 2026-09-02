import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatesGrid } from "./StatesGrid";
import { stateDimensionsOf } from "../../types/data";
import type { ComponentContract } from "../../types/data";

const DIMENSIONAL: ComponentContract = {
  name: "Button",
  layer: "primitive",
  states: {
    dimensions: {
      pointer: {
        category: "interaction",
        values: ["default", "hover", "active"],
        initial: "default",
      },
      availability: {
        category: "availability",
        effect: "restyle",
        values: ["enabled", "disabled"],
        initial: "enabled",
        suppresses: { categories: ["interaction"] },
      },
    },
  },
} as ComponentContract;

describe("stateDimensionsOf", () => {
  it("returns authored axis entries in order, empty when no states", () => {
    expect(stateDimensionsOf({ name: "Stack", layer: "primitive" } as ComponentContract)).toEqual([]);
    const entries = stateDimensionsOf(DIMENSIONAL);
    expect(entries).toHaveLength(2);
    expect(entries.map(([axis]) => axis)).toEqual(["pointer", "availability"]);
  });
});

describe("StatesGrid", () => {
  it("renders one card per declared state axis with its category and values", () => {
    render(<StatesGrid contract={DIMENSIONAL} />);
    expect(screen.getByText("pointer")).toBeInTheDocument();
    // "availability" appears twice: as the axis name and as its category.
    expect(screen.getAllByText("availability")).toHaveLength(2);
    expect(screen.getByText("interaction")).toBeInTheDocument();
    expect(screen.getByText("hover")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
    expect(screen.getByText("disabled")).toBeInTheDocument();
  });

  it("marks the initial value of each axis", () => {
    render(<StatesGrid contract={DIMENSIONAL} />);
    expect(screen.getByText("default ·initial")).toBeInTheDocument();
    expect(screen.getByText("enabled ·initial")).toBeInTheDocument();
  });

  it("renders authored effect and suppression flags as meta", () => {
    render(<StatesGrid contract={DIMENSIONAL} />);
    expect(screen.getByText(/effect: restyle/)).toBeInTheDocument();
    expect(screen.getByText(/masks interaction/)).toBeInTheDocument();
  });

  it("mirrors the schema's exclusivity default", () => {
    render(<StatesGrid contract={DIMENSIONAL} />);
    // Both axes omit `exclusive`, so both metas carry the default line —
    // availability's is joined with its effect/suppression flags.
    expect(screen.getAllByText(/one value at a time/)).toHaveLength(2);
  });

  it("renders composability when a dimension is not mutually exclusive", () => {
    const contract = {
      name: "Card",
      layer: "compound",
      states: {
        dimensions: {
          decoration: {
            category: "presentation",
            values: ["plain", "elevated", "outlined"],
            exclusive: false,
          },
        },
      },
    } as ComponentContract;
    render(<StatesGrid contract={contract} />);
    expect(screen.getByText("values compose freely")).toBeInTheDocument();
    expect(screen.getByText("elevated")).toBeInTheDocument();
  });

  it("renders nothing for a contract without states", () => {
    const { container } = render(
      <StatesGrid contract={{ name: "Stack", layer: "primitive" } as ComponentContract} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
