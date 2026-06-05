import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentBundle, ComponentContract } from "../../types/data";

// EvidencePanel imports the bundle from the virtual:fsds/data-backed module,
// which vitest does not resolve. Mock it with a fixed generatedAt so the
// timestamp assertion is deterministic.
vi.mock("../../types/bundle", () => ({
  bundle: { generatedAt: 1_700_000_000_000 },
}));

import { A2UIDescriptorPanel } from "./A2UIDescriptorPanel";
import { EvidencePanel } from "./EvidencePanel";

/** A contract that authors a real a2ui block + a channel + an enum prop. */
function contractWithA2UI(): ComponentContract {
  return {
    name: "Switchy",
    layer: "primitive",
    category: "action",
    a2ui: {
      category: "action",
      usageHints: ["Use for binary on/off."],
      children: { allowed: false },
    },
    props: {
      designed: {
        members: [
          { name: "size", type: "'sm' | 'md' | 'lg'", description: "Control size" },
          { name: "checked", type: "boolean", description: "On/off", required: true },
        ],
      },
    },
    channels: {
      checkedness: { value: "checked", onChange: "onCheckedChange" },
    },
  } as ComponentContract;
}

function bundleFor(contract: ComponentContract, sources: ComponentBundle["sources"]): ComponentBundle {
  return {
    name: contract.name,
    contract,
    contractPath: `packages/ds-contracts/components/${contract.name}/${contract.name}.contract.json`,
    sources,
    usage: [],
  };
}

describe("A2UIDescriptorPanel (A1, A3)", () => {
  it("A1: renders the derived agent-facing projection for a contract with an a2ui block", () => {
    const { container } = render(<A2UIDescriptorPanel contract={contractWithA2UI()} />);
    console.log("\n=== A2UI panel rendered HTML ===\n" + container.innerHTML);

    // agent category surfaced
    expect(screen.getByText("action")).toBeInTheDocument();
    // usage hint surfaced
    expect(screen.getByText("Use for binary on/off.")).toBeInTheDocument();
    // the enum-typed designed prop appears with its enum domain
    expect(screen.getByText("size")).toBeInTheDocument();
    expect(screen.getByText("sm, md, lg")).toBeInTheDocument();
    // the channel projects into the events/channels table
    expect(screen.getByText("checkedness")).toBeInTheDocument();
    // the empty "no descriptor" state is NOT shown
    expect(screen.queryByText(/No A2UI descriptor authored/)).toBeNull();
  });

  it("A3: degrades to an explicit empty state when no a2ui.category is authored (does not throw)", () => {
    const noA2ui = {
      name: "Plain",
      layer: "primitive",
      // no a2ui block at all -> deriveA2UIDescriptor throws -> panel catches
    } as ComponentContract;

    expect(() => render(<A2UIDescriptorPanel contract={noA2ui} />)).not.toThrow();
    expect(screen.getByText(/No A2UI descriptor authored for Plain/)).toBeInTheDocument();
  });
});

describe("EvidencePanel (A2)", () => {
  it("A2: shows bundle-derivable provenance facts and per-framework source presence", () => {
    const component = bundleFor(contractWithA2UI(), {
      react: { component: { filename: "Switchy.tsx", code: "" }, siblings: [] },
      vue: { component: { filename: "Switchy.vue", code: "" }, siblings: [] },
      // svelte/angular/lit intentionally absent
    });

    const { container } = render(<EvidencePanel component={component} />);
    console.log("\n=== Evidence panel rendered HTML ===\n" + container.innerHTML);

    // contractPath provenance
    expect(
      screen.getByText("packages/ds-contracts/components/Switchy/Switchy.contract.json"),
    ).toBeInTheDocument();
    // generatedAt rendered as ISO (deterministic via the mock)
    expect(
      screen.getByText(new Date(1_700_000_000_000).toISOString()),
    ).toBeInTheDocument();

    // per-framework source presence: react/vue present, others absent
    const tableHtml = container.querySelector("table")?.innerHTML ?? "";
    expect(tableHtml).toContain("react");
    expect(tableHtml).toContain("present");
    expect(tableHtml).toContain("absent");
  });

  it("A3: states the non-claims explicitly, with runtime-rail now bound as coverage", () => {
    const component = bundleFor(contractWithA2UI(), {
      react: { component: { filename: "Switchy.tsx", code: "" }, siblings: [] },
    });
    render(<EvidencePanel component={component} />);

    // admission-rail and token-gate remain unbound in-app
    expect(screen.getByText(/Admission-rail status is not bound in-app/)).toBeInTheDocument();
    expect(screen.getByText(/Token-gate status is not bound in-app/)).toBeInTheDocument();
    // runtime-rail is now BOUND as coverage; the non-claim is about last-run status
    expect(
      screen.getByText(/Runtime-rail binding is coverage, not last-run status/),
    ).toBeInTheDocument();
    // the quality non-claim from the governing doc
    expect(screen.getByText(/proves projection, not quality/)).toBeInTheDocument();
    // the old "not bound in-app" runtime-rail residual is gone
    expect(screen.queryByText(/Runtime-rail facts are not bound in-app/)).toBeNull();
  });
});

/** A minimal contract carrying just a name + layer (rail lookup keys on name). */
function minimalContract(name: string): ComponentContract {
  return { name, layer: "primitive" } as ComponentContract;
}

describe("EvidencePanel — runtime-rail coverage (A1, A4)", () => {
  it("A1: a rail-covered component shows per-framework asserted facts incl. non-default mechanisms", () => {
    // Progress is rail-covered with a non-default `value` fact (q-param + fixture).
    const component = bundleFor(minimalContract("Progress"), {
      react: { component: { filename: "Progress.tsx", code: "" }, siblings: [] },
    });
    const { container } = render(<EvidencePanel component={component} />);
    console.log("\n=== Evidence panel (Progress) runtime-rail coverage ===\n" + container.innerHTML);

    expect(screen.getByText("Runtime-rail coverage")).toBeInTheDocument();
    // default-prop facts asserted for all five frameworks (5 exact "asserted" cells)
    expect(screen.getAllByText("asserted")).toHaveLength(5);
    // non-default: R/V/S/L via query-param (4), Angular via fixed fixture (1)
    expect(screen.getAllByText("asserted (query-param)")).toHaveLength(4);
    expect(screen.getAllByText("asserted (fixed fixture)")).toHaveLength(1);
    // the non-default prop is named, framed as coverage not pass/fail
    expect(container.textContent).toContain("non-default prop: value");
    expect(container.textContent).toContain("not a claim that the last CI run passed");
    // a covered component renders BOTH tables (realizations + rail coverage)
    expect(container.querySelectorAll("table")).toHaveLength(2);
  });

  it("A4: an uncovered component shows a neutral 'no rail facts asserted', not a failure", () => {
    // Button is not in the rail coverage projection.
    const component = bundleFor(minimalContract("Button"), {
      react: { component: { filename: "Button.tsx", code: "" }, siblings: [] },
    });
    const { container } = render(<EvidencePanel component={component} />);

    expect(screen.getByText(/No rail facts asserted for this component/)).toBeInTheDocument();
    expect(container.textContent).toContain("absence here is neutral, not a failure");
    // only the realizations table renders — no rail-coverage table
    expect(container.querySelectorAll("table")).toHaveLength(1);
  });
});
