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

  it("A2: states the rail/runtime/token non-claims explicitly", () => {
    const component = bundleFor(contractWithA2UI(), {
      react: { component: { filename: "Switchy.tsx", code: "" }, siblings: [] },
    });
    render(<EvidencePanel component={component} />);

    // each CI-side surface is named as NOT bound in-app
    expect(screen.getByText(/Admission-rail status is not bound in-app/)).toBeInTheDocument();
    expect(screen.getByText(/Runtime-rail facts are not bound in-app/)).toBeInTheDocument();
    expect(screen.getByText(/Token-gate status is not bound in-app/)).toBeInTheDocument();
    // the quality non-claim from the governing doc
    expect(screen.getByText(/proves projection, not quality/)).toBeInTheDocument();
  });
});
